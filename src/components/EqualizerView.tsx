import React, { useState, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { toast } from "sonner";

interface EqPreset {
  id: string;
  name: string;
  bass: number;
  mids: number;
  treble: number;
  userId: string;
}

export const EqualizerView: React.FC = () => {
  const [bass, setBass] = useState(50);
  const [mids, setMids] = useState(50);
  const [treble, setTreble] = useState(50);
  const [presetName, setPresetName] = useState("");
  const [presets, setPresets] = useState<EqPreset[]>([]);

  useEffect(() => {
    const fetchPresets = async () => {
      if (!auth.currentUser) return;
      const q = query(
        collection(db, "users", auth.currentUser.uid, "eqPresets")
      );
      const querySnapshot = await getDocs(q);
      const fetchedPresets: EqPreset[] = [];
      querySnapshot.forEach((doc) => {
        fetchedPresets.push({ id: doc.id, ...doc.data() } as EqPreset);
      });
      setPresets(fetchedPresets);
    };
    fetchPresets();
  }, []);

  const savePreset = async () => {
    if (!auth.currentUser || !presetName) return;
    try {
      await addDoc(collection(db, "users", auth.currentUser.uid, "eqPresets"), {
        name: presetName,
        bass,
        mids,
        treble,
        userId: auth.currentUser.uid,
      });
      toast.success("Preset saved!");
      setPresetName("");
      // Refresh presets
      const q = query(
        collection(db, "users", auth.currentUser.uid, "eqPresets")
      );
      const querySnapshot = await getDocs(q);
      const fetchedPresets: EqPreset[] = [];
      querySnapshot.forEach((doc) => {
        fetchedPresets.push({ id: doc.id, ...doc.data() } as EqPreset);
      });
      setPresets(fetchedPresets);
    } catch (e) {
      toast.error("Failed to save preset");
    }
  };

  const loadPreset = (preset: EqPreset) => {
    setBass(preset.bass);
    setMids(preset.mids);
    setTreble(preset.treble);
    toast.success(`Loaded ${preset.name}`);
  };

  return (
    <div className="w-full h-full p-6 flex flex-col gap-8 overflow-y-auto">
      <h2 className="text-xl font-bold text-white mb-4">Equalizer</h2>
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm text-neutral-400">Bass</label>
          <Slider value={[bass]} onValueChange={(v) => setBass(v[0])} max={100} step={1} />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-neutral-400">Mids</label>
          <Slider value={[mids]} onValueChange={(v) => setMids(v[0])} max={100} step={1} />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-neutral-400">Treble</label>
          <Slider value={[treble]} onValueChange={(v) => setTreble(v[0])} max={100} step={1} />
        </div>
      </div>
      
      <div className="space-y-4 border-t border-neutral-800 pt-6">
        <h3 className="text-lg font-bold text-white">Save Preset</h3>
        <div className="flex gap-2">
          <Input 
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="Preset Name"
          />
          <Button onClick={savePreset}>Save</Button>
        </div>
      </div>

      <div className="space-y-4 border-t border-neutral-800 pt-6">
        <h3 className="text-lg font-bold text-white">Load Preset</h3>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button key={preset.id} variant="secondary" onClick={() => loadPreset(preset)}>
              {preset.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};
