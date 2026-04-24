import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Plus, 
  Trash2, 
  Info,
  Music,
  DollarSign,
  Layers,
  Percent,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// shadcn/ui components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const GENRES = [
  'Electronic', 'Techno', 'House', 'Ambient', 'Drum & Bass', 
  'Dubstep', 'Phonk', 'Cloud Rap', 'Hyperpop', 'Glitch'
];

const mintFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().min(1, 'Description is required').max(1000),
  genre: z.string().min(1, 'Please select a genre'),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Price must be a positive number",
  }),
  supply: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
    message: "Supply must be at least 1",
  }),
  royalties: z.array(z.object({
    address: z.string().min(1, 'Wallet address is required'),
    percentage: z.number().min(0).max(100),
  })).min(1, 'At least one recipient is required'),
});

type MintFormValues = z.infer<typeof mintFormSchema>;

interface MintTrackDialogProps {
  children?: React.ReactNode;
}

export function MintTrackDialog({ children }: MintTrackDialogProps) {
  const [open, setOpen] = React.useState(false);
  
  const form = useForm<MintFormValues>({
    resolver: zodResolver(mintFormSchema),
    defaultValues: {
      title: '',
      description: '',
      genre: '',
      price: '1',
      supply: '10',
      royalties: [{ address: 'Your Wallet', percentage: 10 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "royalties",
  });

  const totalPercentage = form.watch('royalties').reduce((acc, curr) => acc + curr.percentage, 0);

  function onSubmit(values: MintFormValues) {
    if (totalPercentage > 100) {
      toast.error('Total royalties cannot exceed 100%');
      return;
    }

    console.log('Minting track with metadata:', values);
    toast.success('Track metadata configured successfully!');
    setOpen(false);
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl px-6 py-6 text-[11px] font-black uppercase tracking-widest transition-all">
            <Plus className="mr-2 h-4 w-4" />
            Mint New Track
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-none shadow-2xl rounded-3xl p-0 no-scrollbar">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md px-8 py-6 flex items-center justify-between border-none">
          <div>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">Mint Logic Grid</DialogTitle>
            <DialogDescription className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em] mt-1">
              Initialize NFT Metadata Protocol
            </DialogDescription>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 px-8 pb-8 pt-2">
            
            {/* --- Section 1: Core Data --- */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-muted-foreground/50" />
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Core Data</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Track Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter track title..." className="bg-muted/30 border-none rounded-xl h-12 focus-visible:ring-blue-500 placeholder:text-muted-foreground/30 font-bold" {...field} />
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold uppercase" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="genre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Genre Signature</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-muted/30 border-none rounded-xl h-12 focus:ring-blue-500 font-bold">
                            <SelectValue placeholder="Select genre" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-background border-none rounded-2xl shadow-2xl">
                          {GENRES.map((genre) => (
                            <SelectItem key={genre} value={genre} className="text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 m-1">
                              {genre}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px] font-bold uppercase" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Metadata Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Neural interface context for this audio asset..." 
                        className="bg-muted/30 border-none rounded-xl min-h-[100px] focus-visible:ring-blue-500 placeholder:text-muted-foreground/30 font-bold resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold uppercase" />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="bg-muted/30" />

            {/* --- Section 2: Economics --- */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-muted-foreground/50" />
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Economics</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Unit Price (TON)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type="number" step="0.1" className="bg-muted/30 border-none rounded-xl h-12 pl-12 focus-visible:ring-blue-500 font-black" {...field} />
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 font-black">💎</div>
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] font-bold uppercase" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supply"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">Max Supply</FormLabel>
                      <FormControl>
                        <Input type="number" className="bg-muted/30 border-none rounded-xl h-12 focus-visible:ring-blue-500 font-black" {...field} />
                      </FormControl>
                      <FormDescription className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">
                        Total copies of this NFT to mint
                      </FormDescription>
                      <FormMessage className="text-[10px] font-bold uppercase" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="bg-muted/30" />

            {/* --- Section 3: Royalty Splits --- */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4 text-muted-foreground/50" />
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Royalty Splits</h3>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                  totalPercentage > 100 ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-500"
                )}>
                  Total: {totalPercentage}%
                </div>
              </div>

              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {fields.map((field, index) => (
                    <motion.div 
                      key={field.id}
                      initial={{ opacity: 0, height: 0, scale: 0.95 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.95 }}
                      className="flex items-end gap-3 bg-muted/20 p-4 rounded-2xl relative group overflow-hidden"
                    >
                      <div className="flex-1 space-y-4">
                        <FormField
                          control={form.control}
                          name={`royalties.${index}.address`}
                          render={({ field }) => (
                            <FormItem className="space-y-1">
                              <FormLabel className="text-[9px] font-black uppercase text-muted-foreground/50">Recipient Address</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="v4R2... (TON Address)" 
                                  className="bg-muted/30 border-none rounded-lg h-9 text-[11px] font-bold focus-visible:ring-blue-500" 
                                  {...field} 
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name={`royalties.${index}.percentage`}
                          render={({ field }) => (
                            <FormItem className="space-y-2">
                              <div className="flex justify-between">
                                <FormLabel className="text-[9px] font-black uppercase text-muted-foreground/50">Percentage Share</FormLabel>
                                <span className="text-[10px] font-black text-blue-500">{field.value}%</span>
                              </div>
                              <FormControl>
                                <Slider
                                  min={0}
                                  max={100}
                                  step={1}
                                  value={[field.value]}
                                  onValueChange={(vals) => field.onChange(vals[0])}
                                  className="py-1"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      {fields.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => remove(index)}
                          className="h-9 w-9 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed border-2 border-muted/50 hover:border-blue-500/50 hover:bg-blue-500/5 rounded-2xl h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 hover:text-blue-500 transition-all"
                  onClick={() => append({ address: '', percentage: 0 })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Recipient
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-4 sticky bottom-0 z-10 bg-background/80 backdrop-blur-md -mx-8 px-8 pb-0 border-none">
              <Button 
                type="submit" 
                className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 group"
              >
                <CheckCircle2 className="mr-3 h-4 w-4 transition-transform group-hover:scale-125" />
                Initialize Mint Protocol
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
