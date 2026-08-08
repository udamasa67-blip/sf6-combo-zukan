import { useEffect } from "react";
import { getCharacterConfig } from "@/lib/characterConfig";

function countVideos(characterId: string) {
  const config = getCharacterConfig(characterId);
  return config?.combos.filter((combo) => combo.videoAsset).length ?? 0;
}

export default function ArchiveHome() {
  useEffect(() => {
    const title = "SF6 コンボ図鑑｜ダメージ・起き攻め・Drive効率を検索";
    const description = "SF6 コンボ図鑑。ダメージ・起き攻め・Drive効率を検索できるキャラクター別コンボアーカイブ。";

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
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}/`;
  }, []);

  const elenaComboCount = getCharacterConfig("elena")?.combos.length ?? 0;
  const elenaVideoCount = countVideos("elena");
  const ingridComboCount = getCharacterConfig("ingrid")?.combos.length ?? 0;
  const ingridVideoCount = countVideos("ingrid");
  const yasmineComboCount = getCharacterConfig("yasmine")?.combos.length ?? 0;
  const yasmineVideoCount = countVideos("yasmine");

  return (
    <main className="archive-home">
      <section className="archive-hero" aria-labelledby="archive-title">
        <div className="archive-hero-inner">
          <h1 id="archive-title" className="archive-visually-hidden">
            MIYABI COMBO ARCHIVE SF6 コンボ図鑑【雅】 ダメージ・起き攻め・Drive効率を一括検索
          </h1>
          <figure className="archive-hero-art" aria-label="MIYABI COMBO ARCHIVE SF6 コンボ図鑑【雅】">
            <img
              src="/images/miyabi-hero.png"
              alt="MIYABI COMBO ARCHIVE SF6 コンボ図鑑【雅】 ダメージ・起き攻め・Drive効率を一括検索"
            />
          </figure>
        </div>

        <div className="archive-status-strip" aria-label="公開状況">
          <span>公開中: エレナ / イングリッド / ヤスミン</span>
        </div>
      </section>

      <section className="archive-character-zone" aria-labelledby="character-list-title">
        <div className="archive-section-heading">
          <p className="archive-kicker">Character select</p>
          <h2 id="character-list-title">キャラクター別コンボ一覧</h2>
        </div>

        <div className="archive-character-grid">
          <a className="archive-character-card available" href="/elena">
            <div className="archive-card-main">
              <span className="archive-card-status">公開中</span>
              <h3>エレナ</h3>
              <p>起き攻め有利、リーサル、Drive消費、動画付きルートを検索できます。</p>
            </div>
            <dl className="archive-card-stats">
              <div>
                <dt>Combos</dt>
                <dd>{elenaComboCount}</dd>
              </div>
              <div>
                <dt>Videos</dt>
                <dd>{elenaVideoCount}</dd>
              </div>
            </dl>
            <span className="archive-card-action">エレナを見る</span>
          </a>

          <a className="archive-character-card available" href="/ingrid" aria-label="イングリッド">
            <div className="archive-card-main">
              <span className="archive-card-status">公開中</span>
              <h3>イングリッド</h3>
              <p>ストック管理、セットプレイ、Drive消費、動画付きルートを検索できます。</p>
            </div>
            <dl className="archive-card-stats">
              <div>
                <dt>Combos</dt>
                <dd>{ingridComboCount}</dd>
              </div>
              <div>
                <dt>Videos</dt>
                <dd>{ingridVideoCount}</dd>
              </div>
            </dl>
            <span className="archive-card-action">イングリッドを見る</span>
          </a>

          <a className="archive-character-card available" href="/yasmine" aria-label="ヤスミン">
            <div className="archive-card-main">
              <span className="archive-card-status">準備中</span>
              <h3>ヤスミン</h3>
              <p>コンボカード追加に向けて、起き攻め・リーサル・Drive消費を整理できるページ構成を準備しています。</p>
            </div>
            <dl className="archive-card-stats">
              <div>
                <dt>Combos</dt>
                <dd>{yasmineComboCount}</dd>
              </div>
              <div>
                <dt>Videos</dt>
                <dd>{yasmineVideoCount}</dd>
              </div>
            </dl>
            <span className="archive-card-action">ヤスミンを見る</span>
          </a>
        </div>
      </section>

      <section className="archive-tool-zone" aria-labelledby="combo-tool-link-title">
        <div className="archive-section-heading">
          <p className="archive-kicker">Command builder</p>
          <h2 id="combo-tool-link-title">SF6コンボ入力コマンド作成ツール</h2>
        </div>
        <a className="archive-tool-card" href="/SF6_combo_tool">
          <div>
            <span className="archive-card-status">ツール</span>
            <h3>クリックだけでコンボ表記を作成</h3>
            <p>方向入力・攻撃ボタン・キャンセル記号を選んで、コンボ入力コマンドをコピーできます。</p>
          </div>
          <span className="archive-card-action">ツールを開く</span>
        </a>
      </section>
    </main>
  );
}
