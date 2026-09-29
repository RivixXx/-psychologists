import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "MindPlace — психологическая поддержка рядом";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function OpenGraphImage() {
  const forest = await readFile(
    join(process.cwd(), "public/images/misty-rain-forest.png"),
  );
  const forestData = `data:image/png;base64,${forest.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          backgroundColor: "#21473f",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <img
          src={forestData}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(100deg, rgba(16,43,38,.92) 0%, rgba(22,57,49,.72) 54%, rgba(20,50,43,.12) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 82,
            top: 88,
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 74,
              height: 74,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 25,
              background: "linear-gradient(145deg, rgba(238,250,245,.96), rgba(163,214,200,.84))",
              boxShadow: "0 12px 32px rgba(3,27,23,.28)",
              color: "#17645a",
              fontSize: 43,
              fontWeight: 700,
            }}
          >
            M
          </div>
          <div
            style={{
              display: "flex",
              color: "#fff",
              fontSize: 58,
              fontWeight: 700,
              letterSpacing: -1.5,
            }}
          >
            MindPlace
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            right: 115,
            bottom: 66,
            width: 300,
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,.58)",
            background: "rgba(239,248,244,.2)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.66), 0 18px 50px rgba(7,31,27,.2)",
          }}
        >
          <div style={{ position: "relative", width: 178, height: 190, display: "flex" }}>
            <div
              style={{
                position: "absolute",
                left: 12,
                top: 35,
                width: 108,
                height: 142,
                borderRadius: "50%",
                transform: "rotate(-23deg)",
                background: "linear-gradient(145deg, rgba(196,235,221,.96), rgba(58,147,129,.9))",
                boxShadow: "inset 8px 8px 18px rgba(255,255,255,.48), 0 15px 28px rgba(7,47,40,.22)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 66,
                top: 11,
                width: 108,
                height: 142,
                borderRadius: "50%",
                transform: "rotate(23deg)",
                background: "linear-gradient(145deg, rgba(231,249,240,.98), rgba(105,190,169,.9))",
                boxShadow: "inset 8px 8px 18px rgba(255,255,255,.62), 0 15px 28px rgba(7,47,40,.18)",
              }}
            />
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
