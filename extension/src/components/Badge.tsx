import "./badge.css";

export type BadgeProps = {
  status: "ok" | "no_data" | "unknown_reference" | "loading" | "error";
  medianUsd?: number;
  sampleSize?: number;
  deltaPercent?: number;
  deltaAbsUsd?: number;
};

export function Badge(props: BadgeProps) {
  if (props.status === "loading") {
    return <div class="ws-badge ws-loading">WatchSentry…</div>;
  }
  if (props.status === "unknown_reference") {
    return (
      <div class="ws-badge ws-neutral">
        <strong>WatchSentry</strong>
        <div class="ws-foot ws-foot-flush">
          We don't have this reference yet — adding new ones weekly based on what people view.
        </div>
      </div>
    );
  }
  if (props.status === "no_data") {
    return (
      <div class="ws-badge ws-neutral">
        <strong>WatchSentry</strong>
        <div class="ws-foot ws-foot-flush">
          Not enough recent listing data to estimate a price yet.
        </div>
      </div>
    );
  }
  if (props.status === "error") {
    return (
      <div class="ws-badge ws-neutral">
        <strong>WatchSentry</strong>
        <div class="ws-foot ws-foot-flush">
          Couldn't reach WatchSentry just now — try reloading the page.
        </div>
      </div>
    );
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
            {props.deltaAbsUsd !== undefined && props.deltaAbsUsd !== 0 && (
              <span class="ws-delta-abs">
                {" · $"}
                {Math.abs(props.deltaAbsUsd).toLocaleString()}{" "}
                {props.deltaAbsUsd < 0 ? "below" : "above"}
              </span>
            )}
          </strong>
        </div>
      )}
      <div class="ws-foot">
        <span class="ws-foot-brand">WatchSentry</span> · {props.sampleSize} active listing
        {props.sampleSize === 1 ? "" : "s"} · 90d
      </div>
    </div>
  );
}
