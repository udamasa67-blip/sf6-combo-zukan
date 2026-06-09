import { useEffect } from "react";
import { ComboClickBuilder } from "@/components/ComboClickBuilder";

export default function ComboToolPage() {
  useEffect(() => {
    const title = "SF6コンボ入力コマンド作成ツール｜SF6 コンボ図鑑";
    const description = "SF6のコンボ入力コマンドをクリックだけで作成し、テキストとしてコピーできるツール。";

    document.title = title;

    const setMeta = (selector: string, attributes: Record<string, string>) => {
      let element = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement("meta");
        Object.entries(attributes)
          .filter(([key]) => key !== "content")
          .forEach(([key, value]) => element?.setAttribute(key, value));
        document.head.appendChild(element);
      }
      if (attributes.content) element.setAttribute("content", attributes.content);
    };

    setMeta('meta[name="description"]', { name: "description", content: description });
    setMeta('meta[property="og:title"]', { property: "og:title", content: title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: description });
    setMeta('meta[property="og:type"]', { property: "og:type", content: "website" });

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + "/SF6_combo_tool";
  }, []);

  return (
    <main className="archive-home combo-tool-page">
      <div className="combo-tool-page-nav">
        <a href="/" className="combo-tool-back-link">Main Menu</a>
      </div>
      <ComboClickBuilder />
    </main>
  );
}
