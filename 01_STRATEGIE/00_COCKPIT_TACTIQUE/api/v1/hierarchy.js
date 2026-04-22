export default function handler(req, res) {
  const hierarchy = {
    name: "CEO HUB",
    type: "ROOT",
    children: [
      {
        name: "Commercial",
        type: "POLE",
        children: [
          { name: "AGENT_BUSINESS", type: "AGENT", status: "Online", expertise: "PRO" },
          { name: "AGENT_SALES", type: "AGENT", status: "Online", expertise: "MAX" }
        ]
      },
      {
        name: "Technique",
        type: "POLE",
        children: [
          { name: "AGENT_DEV", type: "AGENT", status: "Online", expertise: "ELITE" }
        ]
      }
    ]
  };
  res.status(200).json(hierarchy);
}
