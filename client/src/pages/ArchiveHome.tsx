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

      <section className="archive-introduction" aria-labelledby="archive-intro-title">
        <p className="archive-kicker">このサイトでできること</p>
        <h2 id="archive-intro-title">次の練習に使うコンボを、見つけよう。</h2>
        <p>SF6 コンボ図鑑【雅】は、ストリートファイター6のコンボを動画とデータで調べられる攻略サイトです。キャラクターを選び、ダメージ・起き攻め・Drive消費を比べながら、状況に合うルートを探せます。</p>
        <p>まずは再現しやすい基本コンボから。動画で動きを確認し、ゲージを使う場面やコンボ後の攻めまで練習してみましょう。掲載内容はゲームの更新によって変わる場合があります。</p>
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

          <a className="archive-character-card available" href="/yasmine/" aria-label="ヤスミン">
            <div className="archive-card-main">
              <span className="archive-card-status">公開中</span>
              <h3>ヤスミン</h3>
              <p>基本コンボ、起き攻め、SA2、バヤニ・モード、画面端セットプレイを動画付きで検索できます。</p>
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
      <section className="archive-related" aria-labelledby="relic-title">
        <div className="archive-section-heading">
          <p className="archive-kicker">運営者が制作したブラウザーゲーム</p>
          <h2 id="relic-title">モンスターレリック</h2>
        </div>
        <div className="archive-relic-card">
          <a href="https://monsterrelic.miyabi-combo.com/about" aria-label="モンスターレリックのゲーム紹介を見る">
            <img src="https://monsterrelic.miyabi-combo.com/screenshots/introduction/player-d3.png" alt="モンスターレリックの実プレイ画面。4体の敵と、攻撃・回復カードが揃った手札。" width="1915" height="955" loading="lazy" />
          </a>
          <div className="archive-relic-copy">
            <p className="archive-kicker">無料 / ターン制ローグライクRPG</p>
            <h3>今ある手札で、次の一手を。</h3>
            <p>毎回変わるダンジョンを、拾ったカードと必殺技で攻略。敵の位置と手札を見て、攻めるか、回復するか、切り抜ける方法を考えよう。</p>
            <p>スマートフォン・PCのブラウザーで遊べます。実際のプレイ画面や冒険セットの使い方は、ゲーム紹介でご覧いただけます。</p>
            <div className="archive-related-actions"><a href="https://monsterrelic.miyabi-combo.com/about">ゲームの紹介を見る →</a><a href="https://monsterrelic.miyabi-combo.com/">無料で遊ぶ →</a></div>
          </div>
        </div>
      </section>
    </main>
  );
}
