import ShareableTopFive from "@/components/profile/ShareableTopFive";

const mockSlots = [
  { position: 1, rapper: { id: "1", name: "Homeboy Sandman", image_url: "/dev-mock-1.webp" } },
  { position: 2, rapper: { id: "2", name: "Black Thought", image_url: "/dev-mock-2.webp" } },
  { position: 3, rapper: { id: "3", name: "Lupe Fiasco", image_url: "/dev-mock-3.webp" } },
  { position: 4, rapper: { id: "4", name: "Royce da 5'9\"", image_url: "/dev-mock-1.webp" } },
  { position: 5, rapper: { id: "5", name: "Kanye West", image_url: "/dev-mock-2.webp" } },
];

const DevTop5Preview = () => (
  <div style={{ background: "#111", padding: 24, display: "flex", flexDirection: "column", gap: 24, alignItems: "flex-start" }}>
    <div data-shot="square"><ShareableTopFive slots={mockSlots} username="S2BKAS" format="square" /></div>
    <div data-shot="landscape"><ShareableTopFive slots={mockSlots} username="S2BKAS" format="landscape" /></div>
    <div data-shot="portrait"><ShareableTopFive slots={mockSlots} username="S2BKAS" format="portrait" /></div>
  </div>
);

export default DevTop5Preview;
