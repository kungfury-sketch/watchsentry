import "./badge.css";

export type BadgeCompactProps = {
  status: "ok" | "no_data" | "unknown_reference" | "loading";
  deltaPercent?: number;
};

export function BadgeCompact(props: BadgeCompactProps) {
  if (props.status !== "ok" || props.deltaPercent === undefined) return null;
  const tone = props.deltaPercent <= -5 ? "good" : props.deltaPercent >= 10 ? "bad" : "neutral";
  return (
    <div class={`ws-badge-compact ws-${tone}`} title="WatchSentry · vs 90-day eBay sold-comp median">
      <span class="ws-brand-chip" aria-label="WatchSentry">WS</span>
      <span class="ws-delta">
        {props.deltaPercent > 0 ? "+" : ""}
        {props.deltaPercent.toFixed(1)}% vs fair
      </span>
    </div>
  );
}
