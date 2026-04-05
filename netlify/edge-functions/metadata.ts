// netlify/edge-functions/metadata.ts

export default async (request: Request, context: any) => {
  const url = new URL(request.url);
  const userAgent = request.headers.get("user-agent") || "";
  
  // Only intercept social media crawlers
  const isCrawler = /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Discordbot/i.test(userAgent);
  
  if (!isCrawler) {
    return; // Let the regular SPA handle it for users
  }

  // Ensure we get the slug even with trailing slashes, common in mobile browser reloads
  const pathParts = url.pathname.split("/").filter(Boolean);
  const blogId = pathParts[pathParts.length - 1];
  
  if (!blogId || url.pathname === "/blog" || url.pathname === "/blog/") return;

  try {
    // Fetch data from your actual backend
    const backendUrl = "https://gw-full-stack.onrender.com/api"; // Replace with your production URL or env var
    const response = await fetch(`${backendUrl}/blogs/${blogId}`);
    
    if (!response.ok) return;
    const blog = await response.json();

    // Get the standard index.html
    const res = await context.next();
    let html = await res.text();

    const title = `${blog.title} | Gaudiya Warriors`;
    const description = blog.description || "Reviving Bengal's heritage and cultural legacy.";
    const image = blog.thumbnail.startsWith('http') ? blog.thumbnail : `https://gaudiyawarriors.netlify.app${blog.thumbnail}`;

    // Inject dynamic meta tags into the HTML
    html = html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
    html = html.replace(/<meta property="og:title" content=".*?" \/>/g, `<meta property="og:title" content="${title}" />`);
    html = html.replace(/<meta property="og:description" content=".*?" \/>/g, `<meta property="og:description" content="${description}" />`);
    html = html.replace(/<meta property="og:image" content=".*?" \/>/g, `<meta property="og:image" content="${image}" />`);
    html = html.replace(/<meta name="twitter:title" content=".*?" \/>/g, `<meta name="twitter:title" content="${title}" />`);
    html = html.replace(/<meta name="twitter:description" content=".*?" \/>/g, `<meta name="twitter:description" content="${description}" />`);
    html = html.replace(/<meta name="twitter:image" content=".*?" \/>/g, `<meta name="twitter:image" content="${image}" />`);

    return new Response(html, {
      headers: { "content-type": "text/html" },
    });
  } catch (error) {
    console.error("Metadata injection error:", error);
    return;
  }
};