import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import mongoose from "mongoose";
import os from "os";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = (usedMem / totalMem) * 100;

    // Database Status
    await dbConnect();
    const dbStatus = mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";

    // CPU Model / Count
    const cpus = os.cpus();
    const cpuModel = cpus[0].model;
    const cpuCount = cpus.length;

    // Process Info
    const uptime = os.uptime();
    const nodeVersion = process.version;
    const platform = os.platform();

    return NextResponse.json({
      success: true,
      health: {
        memory: {
          total: totalMem,
          free: freeMem,
          used: usedMem,
          percent: memUsagePercent.toFixed(1)
        },
        cpu: {
          model: cpuModel,
          count: cpuCount,
          platform: platform
        },
        system: {
          uptime: uptime,
          nodeVersion: nodeVersion,
          dbStatus: dbStatus
        }
      }
    });
  } catch (error) {
    console.error("Health API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
