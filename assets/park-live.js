(function (root) {
  "use strict";
  const BASE = "https://api.themeparks.wiki/v1";
  const MAX_AGE = 5 * 60 * 1000;
  const FRESH_AGE = 20 * 60 * 1000;
  const CITY_DESTINATIONS = {
    orlando: ["Walt Disney World® Resort", "Universal Orlando Resort", "SeaWorld Parks and Resorts Orlando", "LEGOLAND Florida Resort"],
    nyc: ["Six Flags Great Adventure", "LEGOLAND New York Resort"],
    la: ["Disneyland Resort", "Universal Studios Hollywood", "Six Flags Magic Mountain"],
    sf: ["Six Flags Discovery Kingdom", "California's Great America"],
    chicago: ["Six Flags Great America"]
  };
  const cache = new Map();
  async function get(path) {
    const hit = cache.get(path);
    if (hit && Date.now() - hit.time < MAX_AGE) return hit.data;
    const response = await fetch(BASE + path, {signal: AbortSignal.timeout(9000)});
    if (!response.ok) throw new Error("Park data unavailable");
    const data = await response.json();
    cache.set(path, {data, time: Date.now()});
    return data;
  }
  async function parksForCity(city) {
    const names = CITY_DESTINATIONS[city] || [];
    if (!names.length) return [];
    const data = await get("/destinations");
    return (data.destinations || []).filter(d => names.includes(d.name))
      .flatMap(d => (d.parks || []).map(p => ({id:p.id, name:p.name, destination:d.name})));
  }
  async function ridesForPark(id) {
    if (!/^[a-f0-9-]{36}$/i.test(id)) throw new Error("Invalid park ID");
    const [tree, live] = await Promise.all([
      get("/entity/" + id + "/children"),
      get("/entity/" + id + "/live")
    ]);
    const states = new Map((live.liveData || []).map(item => [item.id, item]));
    return (tree.children || []).filter(item => item.entityType === "ATTRACTION").map(item => {
      const state = states.get(item.id);
      const updated = Date.parse(state?.lastUpdated || "");
      const fresh = Number.isFinite(updated) && updated <= Date.now() && Date.now() - updated < FRESH_AGE;
      const wait = fresh && state?.status === "OPERATING" ? state.queue?.STANDBY?.waitTime : null;
      return {name:item.name, status:fresh ? state.status : null,
        wait:Number.isFinite(wait) && wait >= 0 ? wait : null,
        updated:fresh ? updated : null};
    });
  }
  root.ParkLive = {parksForCity, ridesForPark, CITY_DESTINATIONS};
})(typeof window !== "undefined" ? window : globalThis);
