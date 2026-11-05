import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders trusted-but-unescaped Markdown. Raw HTML is ignored and URLs are sanitised by react-markdown. */
export function Markdown({ children, className = "" }: { children?: string; className?: string }) {
  if (!children) return null;
  return (
    <div className={`prose prose-site max-w-none prose-headings:font-serif prose-headings:font-normal prose-a:underline-offset-4 prose-img:rounded-xl lg:prose-lg ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{ a: ({ href, children }) => <a href={href} {...(href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{children}</a> }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
