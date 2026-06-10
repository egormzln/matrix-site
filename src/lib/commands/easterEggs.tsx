import gsap from "gsap";
import { RAIN_BACKGROUND_INTENSITY } from "@/components/scene/rainMaterial";
import { useAppStore } from "@/lib/store/useAppStore";
import type { Command } from "./types";

export const easterEggCommands: Command[] = [
  {
    name: "sudo",
    description: "",
    hidden: true,
    run: (_args, ctx) => {
      ctx.print(
        <p>
          {ctx.profile.name.toLowerCase().replace(" ", "")} is not in the
          sudoers file. This incident will be reported.
        </p>,
        "error",
      );
    },
  },
  {
    name: "matrix",
    description: "",
    hidden: true,
    run: (_args, ctx) => {
      ctx.print(<p className="text-term-bright">Wake up, Neo...</p>);
      const { rainUniformsRef: uniforms, qualityTier } = useAppStore.getState();
      if (!uniforms) return;
      // Surge the rain to full intro brightness, hold, then settle back.
      gsap
        .timeline()
        .to(uniforms.uIntensity, {
          value: 1,
          duration: 1.2,
          ease: "power2.out",
        })
        .to(uniforms.uIntensity, {
          value: RAIN_BACKGROUND_INTENSITY[qualityTier],
          duration: 2.5,
          ease: "power2.inOut",
          delay: 4,
        });
    },
  },
  {
    name: "glitch",
    description: "",
    hidden: true,
    run: (_args, ctx) => {
      ctx.print(<p className="text-term-fg/60">There is no spoon.</p>);
      ctx.triggerGlitch();
    },
  },
];
