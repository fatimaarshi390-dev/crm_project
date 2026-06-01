import Header from "./header";
import WeeklyTargetDialog from "./weeklytarget";
import Link from "next/link";
import { Users, Target } from "lucide-react";

export default function SalesDashboard() {
  const cardStyle = {
    background: "white",
    borderRadius: "28px",
    minHeight: "320px",
    border: "1px solid #f3cfcf",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    padding: "30px 20px",
    textAlign: "center",
  };

  return (
    <>
      <Header />

      <div
        style={{
          minHeight: "100vh",
          background: "#f1f5f9",
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
            gap: "24px",
            maxWidth: "1500px",
            margin: "0 auto",
          }}
        >
          {/* Lead Management Card */}
          <Link
            href="/leads"
            style={{
              textDecoration: "none",
              width: "100%",
            }}
          >
            <div style={cardStyle}>
              <div
                style={{
                  marginBottom: "24px",
                }}
              >
                <Users size={55} color="#d97706" strokeWidth={2.5} />
              </div>

              <h1
                style={{
                  fontSize: "clamp(28px, 5vw, 52px)",
                  fontWeight: "700",
                  color: "#1e3a8a",
                  marginBottom: "14px",
                  lineHeight: "1.2",
                }}
              >
                Lead Management
              </h1>

              <p
                style={{
                  fontSize: "clamp(16px, 2vw, 28px)",
                  color: "#475569",
                  lineHeight: "1.6",
                  maxWidth: "90%",
                }}
              >
                View, add and manage all your leads
              </p>
            </div>
          </Link>

          {/* Weekly Target Card */}
          <div style={cardStyle}>
            <div
              style={{
                marginBottom: "24px",
              }}
            >
              <Target size={55} color="#d97706" strokeWidth={2.5} />
            </div>

            <h1
              style={{
                fontSize: "clamp(28px, 5vw, 52px)",
                fontWeight: "700",
                color: "#1e3a8a",
                marginBottom: "14px",
                lineHeight: "1.2",
              }}
            >
              Weekly Target
            </h1>

            <p
              style={{
                fontSize: "clamp(16px, 2vw, 28px)",
                color: "#475569",
                lineHeight: "1.6",
                marginBottom: "24px",
                maxWidth: "90%",
              }}
            >
              Track your weekly goals and performance
            </p>

            <WeeklyTargetDialog />
          </div>
        </div>
      </div>
    </>
  );
}