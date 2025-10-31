import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message || !message.trim()) {
      return new Response(
        JSON.stringify({ error: "Empty query" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("📝 User query:", message);

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!openaiKey || !supabaseUrl || !supabaseKey) {
      throw new Error("Missing required environment variables");
    }

    // 1. Generate embedding for the query
    console.log("🔮 Generating embedding...");
    const embeddingRes = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: message
      })
    });

    if (!embeddingRes.ok) {
      const error = await embeddingRes.text();
      console.error("❌ Embedding error:", error);
      throw new Error("Failed to generate embedding");
    }

    const embeddingData = await embeddingRes.json();
    const queryEmbedding = embeddingData.data[0].embedding;
    console.log("✅ Embedding generated");

    // 2. Search for similar chunks in Supabase
    console.log("🔍 Searching Supabase...");
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: chunks, error: searchError } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_count: 8,
      filter: {}
    });

    if (searchError) {
      console.error("❌ Search error:", searchError);
      throw searchError;
    }

    console.log(`✅ Found ${chunks?.length || 0} chunks`);

    if (!chunks || chunks.length === 0) {
      return new Response(
        JSON.stringify({
          answer: "I couldn't find relevant information in the knowledge base. Please try rephrasing your question.",
          sources: []
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Build context from chunks
    const context = chunks
      .map((c: any, i: number) => {
        const page = c.metadata?.page || "?";
        return `[${i + 1}] (Page ${page}) ${c.content}`;
      })
      .join('\n\n');

    // 4. Generate answer with GPT
    console.log("🤖 Generating answer...");
    const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content: 'You are a strict RAG assistant answering questions about human nutrition. Answer ONLY using the provided CONTEXT. Always cite your sources using brackets like [1], [2] and include page numbers when available. Be concise and accurate.'
          },
          {
            role: 'user',
            content: `QUESTION: ${message}\n\nCONTEXT:\n${context}`
          }
        ]
      })
    });

    if (!chatRes.ok) {
      const error = await chatRes.text();
      console.error("❌ Chat error:", error);
      throw new Error("Failed to generate answer");
    }

    const chatData = await chatRes.json();
    const answer = chatData.choices[0]?.message?.content || "No answer generated.";
    
    console.log("✅ Answer generated");

    return new Response(
      JSON.stringify({
        answer,
        sources: chunks.map((c: any) => ({
          id: c.id,
          content: c.content,
          page: c.metadata?.page || "?",
          similarity: c.similarity,
          chunk_index: c.chunk_index
        }))
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("❌ Server error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
