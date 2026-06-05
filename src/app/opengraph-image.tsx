import { ImageResponse } from "next/og";
import { APP_NAME } from "@/lib/constants";

export const runtime = "edge";

export const alt = "KidGuardian privacy-first child safety assistant";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #f7faf9 0%, #eef7f4 46%, #eaf2ff 100%)",
          color: "#10231f",
          fontFamily:
            'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "auto auto -140px -100px",
            width: 420,
            height: 420,
            borderRadius: "999px",
            background:
              "radial-gradient(circle, rgba(47,143,122,0.28) 0%, rgba(47,143,122,0.03) 68%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "40px -60px auto auto",
            width: 300,
            height: 300,
            borderRadius: "999px",
            background:
              "radial-gradient(circle, rgba(139,183,255,0.24) 0%, rgba(139,183,255,0.04) 68%, transparent 72%)",
            filter: "blur(18px)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 64,
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "linear-gradient(145deg, rgba(221,244,238,1), rgba(47,143,122,1))",
                boxShadow: "0 18px 40px rgba(47,143,122,0.18)",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: -8,
                  borderRadius: 30,
                  border: "1px solid rgba(47,143,122,0.22)",
                }}
              />
              <svg
                width="30"
                height="30"
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
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em" }}>
                {APP_NAME}
              </div>
              <div style={{ fontSize: 14, color: "#6a7d77" }}>
                Privacy-first child safety assistant
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 40, alignItems: "stretch" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  alignSelf: "flex-start",
                  padding: "8px 14px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(220,233,229,1)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#176b59",
                }}
              >
                No covert recording
              </div>
              <div
                style={{
                  marginTop: 22,
                  fontSize: 70,
                  lineHeight: 0.98,
                  fontWeight: 700,
                  letterSpacing: "-0.07em",
                  maxWidth: 700,
                }}
              >
                Child safety signals, without hidden surveillance.
              </div>
              <div
                style={{
                  marginTop: 18,
                  fontSize: 24,
                  lineHeight: 1.45,
                  color: "#344b45",
                  maxWidth: 760,
                }}
              >
                Transparent, guardian-controlled monitoring for families who want calm clarity,
                pattern review, and professional reports.
              </div>
            </div>

            <div
              style={{
                width: 420,
                borderRadius: 36,
                border: "1px solid rgba(220,233,229,1)",
                background: "rgba(255,255,255,0.82)",
                boxShadow: "0 28px 80px rgba(16,35,31,0.14)",
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#176b59", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                    Emma • 2 years old
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.04em" }}>
                    Risk level: Watch
                  </div>
                </div>
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 999,
                    background: "rgba(221,244,238,0.8)",
                    color: "#176b59",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  Reviewed
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                {[
                  ["Audio mode", "Visible and active"],
                  ["Crying", "2m 14s"],
                  ["Sleep", "Stable"],
                  ["Last alert", "Repeated distress"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      borderRadius: 24,
                      background: "#f9fcfb",
                      border: "1px solid rgba(220,233,229,1)",
                      padding: 14,
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6a7d77" }}>
                      {label}
                    </div>
                    <div style={{ marginTop: 10, fontSize: 20, fontWeight: 700, letterSpacing: "-0.04em" }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 6,
                  alignItems: "end",
                  height: 86,
                  padding: "10px 12px",
                  borderRadius: 24,
                  background:
                    "linear-gradient(180deg, rgba(221,244,238,0.65), rgba(255,255,255,0.95))",
                  border: "1px solid rgba(220,233,229,1)",
                }}
              >
                {[22, 36, 18, 44, 30, 50, 62, 48, 36].map((height, index) => (
                  <div
                    key={index}
                    style={{
                      width: "100%",
                      maxWidth: 24,
                      height,
                      borderRadius: 999,
                      background:
                        "linear-gradient(180deg, rgba(47,143,122,0.96), rgba(139,183,255,0.8))",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {["Guardian-controlled", "Privacy-first", "Audit logged"].map((item) => (
              <div
                key={item}
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.72)",
                  border: "1px solid rgba(220,233,229,1)",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#344b45",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
