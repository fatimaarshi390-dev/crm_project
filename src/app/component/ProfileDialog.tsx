'use client';

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUser } from "../component/context/user-context";
import { User, Mail, Phone, IdCard } from "lucide-react";

export default function ProfileDialog() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 12px",
            width: "100%",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px",
            transition: "0.3s",
          }}
        >
          <User size={18} />
          <span>Profile</span>
        </div>
      </DialogTrigger>

      <DialogContent
        style={{
          width: "95vw",
          maxWidth: "450px",
          borderRadius: "24px",
          padding: "20px",
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{
              fontSize: "28px",
              textAlign: "center",
              fontWeight: "700",
            }}
          >
            My Profile
          </DialogTitle>
        </DialogHeader>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            paddingTop: "20px",
            paddingBottom: "20px",
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: "90px",
              height: "90px",
              background:
                "linear-gradient(to bottom right, #3b82f6, #4f46e5)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "40px",
              fontWeight: "700",
              border: "4px solid white",
              boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
            }}
          >
            {user.name?.charAt(0).toUpperCase()}
          </div>

          {/* User Info */}
          <div
            style={{
              textAlign: "center",
              padding: "0 10px",
              width: "100%",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#111827",
                wordBreak: "break-word",
              }}
            >
              {user.name}
            </h2>

            <p
              style={{
                color: "#6b7280",
                fontSize: "15px",
                textTransform: "capitalize",
                marginTop: "4px",
              }}
            >
              {user.role}
            </p>
          </div>

          {/* Details */}
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {/* Employee ID */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                background: "#f9fafb",
                padding: "14px",
                borderRadius: "16px",
              }}
            >
              <div
                style={{
                  minWidth: "42px",
                  height: "42px",
                  background: "#dbeafe",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IdCard color="#2563eb" size={20} />
              </div>

              <div
                style={{
                  overflow: "hidden",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  Employee ID
                </p>

                <p
                  style={{
                    fontWeight: "600",
                    color: "#111827",
                    fontSize: "15px",
                    wordBreak: "break-all",
                  }}
                >
                  {user.employeeId}
                </p>
              </div>
            </div>

            {/* Email */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                background: "#f9fafb",
                padding: "14px",
                borderRadius: "16px",
              }}
            >
              <div
                style={{
                  minWidth: "42px",
                  height: "42px",
                  background: "#dcfce7",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Mail color="#16a34a" size={20} />
              </div>

              <div
                style={{
                  overflow: "hidden",
                }}
              >
                <p
                  style={{
                    fontSize: "12px",
                    color: "#6b7280",
                  }}
                >
                  Email
                </p>

                <p
                  style={{
                    fontWeight: "500",
                    color: "#111827",
                    fontSize: "15px",
                    wordBreak: "break-all",
                  }}
                >
                  {user.email}
                </p>
              </div>
            </div>

            {/* Phone */}
            {user.phone && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  background: "#f9fafb",
                  padding: "14px",
                  borderRadius: "16px",
                }}
              >
                <div
                  style={{
                    minWidth: "42px",
                    height: "42px",
                    background: "#f3e8ff",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Phone color="#9333ea" size={20} />
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                    }}
                  >
                    Phone Number
                  </p>

                  <p
                    style={{
                      fontWeight: "500",
                      color: "#111827",
                      fontSize: "15px",
                    }}
                  >
                    {user.phone}
                  </p>
                </div>
              </div>
            )}

            {/* Department */}
            {user.department && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  background: "#f9fafb",
                  padding: "14px",
                  borderRadius: "16px",
                }}
              >
                <div
                  style={{
                    minWidth: "42px",
                    height: "42px",
                    background: "#fef3c7",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                  }}
                >
                  🏢
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                    }}
                  >
                    Department
                  </p>

                  <p
                    style={{
                      fontWeight: "500",
                      color: "#111827",
                      fontSize: "15px",
                    }}
                  >
                    {user.department}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            style={{
              width: "100%",
              borderRadius: "12px",
              padding: "10px",
            }}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}