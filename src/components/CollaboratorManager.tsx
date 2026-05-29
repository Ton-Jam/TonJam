import * as React from 'react';
import { useState } from 'react';
import { Plus, Trash2, Search, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

import { Collaborator } from '@/types';

const ROLES = ['Producer', 'Vocalist', 'Engineer', 'Songwriter', 'Instrumentalist'];

interface CollaboratorManagerProps {
  initialCollaborators?: Collaborator[];
  collaborators?: Collaborator[]; 
  onChange?: (collaborators: Collaborator[]) => void;
}

export const CollaboratorManager: React.FC<CollaboratorManagerProps> = ({ 
  initialCollaborators = [],
  collaborators: controlledCollaborators,
  onChange 
}) => {
  const [internalCollaborators, setInternalCollaborators] = useState<Collaborator[]>(initialCollaborators);
  const collaborators = controlledCollaborators || internalCollaborators;
  
  const updateCollaborators = (newCollaborators: Collaborator[]) => {
    if (onChange) {
      onChange(newCollaborators);
    } else {
      setInternalCollaborators(newCollaborators);
    }
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [royalty, setRoyalty] = useState(10);

  const handleAddCollaborator = () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a username or wallet address");
      return;
    }

    const newCollaborator: Collaborator = {
      id: Math.random().toString(36).substring(7),
      name: searchTerm,
      role: selectedRole,
      royalty: royalty,
      address: searchTerm,
    };

    updateCollaborators([...collaborators, newCollaborator]);
    setIsDialogOpen(false);
    setSearchTerm('');
    setRoyalty(10);
    toast.success(`Added ${newCollaborator.name} as ${newCollaborator.role}`);
  };

  const removeCollaborator = (id: string) => {
    updateCollaborators(collaborators.filter(c => c.id !== id));
    toast.info("Collaborator removed");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-foreground tracking-tighter uppercase">Collaborator Registry</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full bg-blue-600 hover:bg-blue-500 gap-2">
              <Plus className="w-4 h-4" /> Add Collaborator
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-background border-border">
            <DialogHeader>
              <DialogTitle>Add New Collaborator</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground">Username or Wallet</label>
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by username or address" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground">Assign Role</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map(role => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-muted-foreground">Royalty Percentage (%)</label>
                <Input 
                  type="number" 
                  value={royalty}
                  onChange={(e) => setRoyalty(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddCollaborator}>Add to Registry</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {collaborators.length > 0 ? (
          collaborators.map((collab) => (
            <div key={collab.id} className="flex items-center justify-between p-4 rounded-[4px] bg-muted/30 border border-border/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-tight">{collab.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px]">{collab.role}</Badge>
                    <span className="text-[10px] text-muted-foreground">{collab.royalty}% Royalty</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeCollaborator(collab.id)}>
                <Trash2 className="w-4 h-4 text-rose-500" />
              </Button>
            </div>
          ))
        ) : (
          <div className="p-8 border border-dashed rounded-xl text-center text-muted-foreground text-sm">
            No active collaborators listed.
          </div>
        )}
      </div>
    </div>
  );
};
