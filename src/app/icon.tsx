import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 18,
          background: "linear-gradient(145deg, #ddf4ee 0%, #2f8f7a 100%)",
          position: "relative",
          boxShadow: "0 12px 28px rgba(47,143,122,0.18)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -5,
            borderRadius: 22,
            border: "1px solid rgba(47,143,122,0.22)",
          }}
        />
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2 20 6v6c0 5-3.4 9.7-8 10-4.6-.3-8-5-8-10V6l8-4z" />
        </svg>
      </div>
    ),
    size
  );
}
