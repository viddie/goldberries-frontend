import { GoldenBerryRenderer, SilverBerryRenderer, StrawberryRenderer } from "./renderers";

const entityMap = {
  goldenBerry: GoldenBerryRenderer,
  "CollabUtils2/SilverBerry": SilverBerryRenderer,
  strawberry: StrawberryRenderer,
};

export function EntityListRenderer({ entities }) {
  return entities.map((e, i) => {
    const Component = entityMap[e.name];
    if (!Component) return null;

    return <Component key={i} entity={e} />;
  });
}
