import "./badge.css";

export type BadgeProps = {
  status: "ok" | "no_data" | "unknown_reference" | "loading";
  medianUsd?: number;
  listedPriceUsd?: number;
  sampleSize?: number;
  deltaPercent?: number;
};

export function Badge(props: BadgeProps) {
  if (props.status === "loading") {
    return <div class="ws-badge ws-loading">WatchSentry…</div>;
  }
  if (props.status === "unknown_reference") {
    return <div class="ws-badge ws-neutral">WatchSentry: reference not yet tracked</div>;
  }
  if (props.status === "no_data") {
    return <div class="ws-badge ws-neutral">WatchSentry: not enough sold-comps yet</div>;
  }
  const tone =
    props.deltaPercent === undefined
      ? "neutral"
      : props.deltaPercent <= -5
        ? "good"
        : props.deltaPercent >= 10
          ? "bad"
          : "neutral";
  return (
    <div class={`ws-badge ws-${tone}`}>
      <div class="ws-row">
        <span class="ws-label">Fair value</span>
        <strong>${props.medianUsd?.toLocaleString()}</strong>
      </div>
      {props.deltaPercent !== undefined && (
        <div class="ws-row">
          <span class="ws-label">Listing vs fair</span>
          <strong>
            {props.deltaPercent > 0 ? "+" : ""}
            {props.deltaPercent.toFixed(1)}%
          </strong>
        </div>
      )}
      <div class="ws-foot">
        based on {props.sampleSize} sold-comp{props.sampleSize === 1 ? "" : "s"} · 90d window
      </div>
    </div>
  );
}
