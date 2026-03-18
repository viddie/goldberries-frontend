import { useMemo } from "react";

import { BatchedEntityMap, IgnoreUnhandled, IndividualEntityMap, SimpleShapeMap } from "./entity_definitions";
import { SimpleShapeRenderer } from "./renderers/SimpleShapeRenderer";
import { useMinimapStore } from "./useMinimapStore";

const FALLBACK_ENTITY_DEF = { color: "white", opacity: 0.1 };
const FALLBACK_TRIGGER_DEF = { color: "#5588ff", opacity: 0.1 };

export function EntityListRenderer({ entities, triggers, simpleShapesVisible }) {
  const showUnhandledEntities = useMinimapStore((s) => s.showUnhandledEntities);
  const showUnhandledTriggers = useMinimapStore((s) => s.showUnhandledTriggers);

  const { individual, batched, simple } = useMemo(() => {
    const individual = [];
    const batchMap = {};
    const simpleMap = {};

    for (const e of entities) {
      const IndividualComponent = IndividualEntityMap[e.name];
      if (IndividualComponent) {
        individual.push({ Component: IndividualComponent, entity: e });
        continue;
      }
      const BatchedComponent = BatchedEntityMap[e.name];
      if (BatchedComponent) {
        if (!batchMap[e.name]) batchMap[e.name] = { Component: BatchedComponent, entities: [] };
        batchMap[e.name].entities.push(e);
        continue;
      }
      const simpleDef = SimpleShapeMap[e.name];
      if (simpleDef) {
        if (!simpleMap[e.name]) simpleMap[e.name] = { def: simpleDef, entities: [] };
        simpleMap[e.name].entities.push(e);
      } else if (showUnhandledEntities && !IgnoreUnhandled.has(e.name)) {
        if (!simpleMap[e.name]) simpleMap[e.name] = { def: FALLBACK_ENTITY_DEF, entities: [] };
        simpleMap[e.name].entities.push(e);
      }
    }

    return {
      individual,
      batched: Object.entries(batchMap),
      simple: Object.entries(simpleMap),
    };
  }, [entities, showUnhandledEntities]);

  const triggerGroups = useMemo(() => {
    if (!triggers || triggers.length === 0) return [];
    const groupMap = {};
    for (const t of triggers) {
      const def = SimpleShapeMap[t.name];
      if (def) {
        if (!groupMap[t.name]) groupMap[t.name] = { def, entities: [] };
        groupMap[t.name].entities.push(t);
      } else if (showUnhandledTriggers && !IgnoreUnhandled.has(t.name)) {
        if (!groupMap[t.name]) groupMap[t.name] = { def: FALLBACK_TRIGGER_DEF, entities: [] };
        groupMap[t.name].entities.push(t);
      }
    }
    return Object.entries(groupMap);
  }, [triggers, showUnhandledTriggers]);

  return (
    <>
      {individual.map(({ Component, entity }, i) => (
        <Component key={i} entity={entity} />
      ))}
      {batched.map(([name, { Component, entities }]) => (
        <Component key={name} entities={entities} />
      ))}
      {simpleShapesVisible && (
        <>
          {simple.map(([name, { def, entities }]) => (
            <SimpleShapeRenderer key={`e-${name}`} entities={entities} def={def} />
          ))}
          {triggerGroups.map(([name, { def, entities }]) => (
            <SimpleShapeRenderer key={`t-${name}`} entities={entities} def={def} />
          ))}
        </>
      )}
    </>
  );
}
