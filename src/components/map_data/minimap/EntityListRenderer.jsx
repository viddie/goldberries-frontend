import {
  GoldenBerryRenderer,
  SilverBerryRenderer,
  SpikeRenderer,
  SpinnerRenderer,
  StrawberryRenderer,
} from "./renderers";

const entityMap = {
  goldenBerry: GoldenBerryRenderer,
  "CollabUtils2/SilverBerry": SilverBerryRenderer,
  strawberry: StrawberryRenderer,
  spikesUp: SpikeRenderer,
  spikesDown: SpikeRenderer,
  spikesLeft: SpikeRenderer,
  spikesRight: SpikeRenderer,
  spinner: SpinnerRenderer,
};

export function EntityListRenderer({ entities }) {
  return entities.map((e, i) => {
    const Component = entityMap[e.name];
    if (!Component) return null;

    return <Component key={i} entity={e} />;
  });
}
