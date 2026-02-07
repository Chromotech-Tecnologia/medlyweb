import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Search, Pencil, Trash2, MoreHorizontal, Clock, ClipboardList } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  initializeStorage,
  STORAGE_KEYS,
  getAll,
  create,
  update,
  softDelete,
} from '@/lib/mocks/storage';
import type { ScaleType } from '@/lib/mocks/types';
import { scaleTypeSchema, type ScaleTypeFormData } from '@/lib/validations';

const shiftLabels: Record<string, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
  plantao_12h: 'Plantão 12h',
  plantao_24h: 'Plantão 24h',
};

export default function ScaleTypes() {
  const [scaleTypes, setScaleTypes] = useState<ScaleType[]>([]);
  const [filteredScaleTypes, setFilteredScaleTypes] = useState<ScaleType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScaleType, setEditingScaleType] = useState<ScaleType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scaleTypeToDelete, setScaleTypeToDelete] = useState<ScaleType | null>(null);
  const { toast } = useToast();

  const form = useForm<ScaleTypeFormData>({
    resolver: zodResolver(scaleTypeSchema),
    defaultValues: {
      name: '',
      description: '',
      defaultDurationHours: 12,
      defaultShift: 'plantao_12h',
    },
  });

  useEffect(() => {
    initializeStorage();
    loadData();
  }, []);

  const loadData = () => {
    const data = getAll<ScaleType>(STORAGE_KEYS.SCALE_TYPES);
    setScaleTypes(data);
    setFilteredScaleTypes(data);
  };

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredScaleTypes(
        scaleTypes.filter(
          (s) =>
            s.name.toLowerCase().includes(term) ||
            s.description?.toLowerCase().includes(term)
        )
      );
    } else {
      setFilteredScaleTypes(scaleTypes);
    }
  }, [searchTerm, scaleTypes]);

  const openDialog = (scaleType?: ScaleType) => {
    if (scaleType) {
      setEditingScaleType(scaleType);
      form.reset({
        name: scaleType.name,
        description: scaleType.description || '',
        defaultDurationHours: scaleType.defaultDurationHours,
        defaultShift: scaleType.defaultShift,
      });
    } else {
      setEditingScaleType(null);
      form.reset();
    }
    setDialogOpen(true);
  };

  const onSubmit = (data: ScaleTypeFormData) => {
    if (editingScaleType) {
      update(STORAGE_KEYS.SCALE_TYPES, editingScaleType.id, data);
      toast({ title: 'Tipo atualizado!', description: `${data.name} foi atualizado.` });
    } else {
      create(STORAGE_KEYS.SCALE_TYPES, data);
      toast({ title: 'Tipo criado!', description: `${data.name} foi adicionado.` });
    }

    setDialogOpen(false);
    loadData();
  };

  const handleDelete = (scaleType: ScaleType) => {
    setScaleTypeToDelete(scaleType);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (scaleTypeToDelete) {
      softDelete(STORAGE_KEYS.SCALE_TYPES, scaleTypeToDelete.id);
      loadData();
      toast({ title: 'Tipo excluído', description: `${scaleTypeToDelete.name} foi removido.` });
    }
    setDeleteDialogOpen(false);
    setScaleTypeToDelete(null);
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tipos de Escala</h1>
            <p className="text-muted-foreground">Configure os tipos de escala disponíveis</p>
          </div>
          <Button onClick={() => openDialog()} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Novo Tipo
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar tipos de escala..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">
              {filteredScaleTypes.length} tipo{filteredScaleTypes.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Turno Padrão</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredScaleTypes.map((scaleType) => (
                  <TableRow key={scaleType.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                          <ClipboardList className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium">{scaleType.name}</span>
                          {scaleType.description && (
                            <p className="text-sm text-muted-foreground">{scaleType.description}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{scaleType.defaultDurationHours}h</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{shiftLabels[scaleType.defaultShift]}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDialog(scaleType)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(scaleType)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingScaleType ? 'Editar Tipo' : 'Novo Tipo de Escala'}
              </DialogTitle>
              <DialogDescription>
                Configure as propriedades do tipo de escala.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ex: Plantão 12h" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição (opcional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Descrição do tipo..." rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="defaultDurationHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duração (horas)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={1}
                            max={48}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="defaultShift"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Turno Padrão</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="manha">Manhã</SelectItem>
                            <SelectItem value="tarde">Tarde</SelectItem>
                            <SelectItem value="noite">Noite</SelectItem>
                            <SelectItem value="plantao_12h">Plantão 12h</SelectItem>
                            <SelectItem value="plantao_24h">Plantão 24h</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingScaleType ? 'Salvar' : 'Criar'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir <strong>{scaleTypeToDelete?.name}</strong>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </MainLayout>
  );
}
