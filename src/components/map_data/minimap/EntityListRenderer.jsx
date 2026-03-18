import { useMemo } from "react";

import {
  GoldenBerryRenderer,
  SilverBerryRenderer,
  SpikeRenderer,
  SpinnerRenderer,
  StrawberryRenderer,
} from "./renderers";

const individualEntityMap = {
  goldenBerry: GoldenBerryRenderer,
  "CollabUtils2/SilverBerry": SilverBerryRenderer,
  strawberry: StrawberryRenderer,
};

const batchedEntityMap = {
  spikesUp: SpikeRenderer,
  spikesDown: SpikeRenderer,
  spikesLeft: SpikeRenderer,
  spikesRight: SpikeRenderer,
  spinner: SpinnerRenderer,
};

export function EntityListRenderer({ entities }) {
  const { individual, batched } = useMemo(() => {
    const individual = [];
    const batchMap = {};
    for (const e of entities) {
      const IndividualComponent = individualEntityMap[e.name];
      if (IndividualComponent) {
        individual.push({ Component: IndividualComponent, entity: e });
        continue;
      }
      const BatchedComponent = batchedEntityMap[e.name];
      if (BatchedComponent) {
        if (!batchMap[e.name]) batchMap[e.name] = { Component: BatchedComponent, entities: [] };
        batchMap[e.name].entities.push(e);
      }
    }
    return { individual, batched: Object.entries(batchMap) };
  }, [entities]);

  return (
    <>
      {individual.map(({ Component, entity }, i) => (
        <Component key={i} entity={entity} />
      ))}
      {batched.map(([name, { Component, entities }]) => (
        <Component key={name} entities={entities} />
      ))}
    </>
  );
}
