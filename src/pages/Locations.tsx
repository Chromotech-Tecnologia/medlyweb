import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  Pencil,
  Trash2,
  MoreHorizontal,
  Loader2,
  Building2,
} from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
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
import type { Location } from '@/lib/mocks/types';
import { locationSchema, type LocationFormData } from '@/lib/validations';

const typeLabels: Record<string, string> = {
  upa: 'UPA',
  ubs: 'UBS',
  hospital: 'Hospital',
  clinica: 'Clínica',
  pronto_socorro: 'Pronto Socorro',
  outro: 'Outro',
};

const typeColors: Record<string, string> = {
  upa: 'bg-destructive/15 text-destructive',
  ubs: 'bg-success/15 text-success',
  hospital: 'bg-info/15 text-info',
  clinica: 'bg-warning/15 text-warning',
  pronto_socorro: 'bg-primary/15 text-primary',
  outro: 'bg-muted text-muted-foreground',
};

// ViaCEP API
async function fetchAddressByCep(cep: string) {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    if (data.erro) return null;
    return {
      street: data.logradouro,
      neighborhood: data.bairro,
      city: data.localidade,
      state: data.uf,
    };
  } catch {
    return null;
  }
}

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const { toast } = useToast();

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      type: 'upa',
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      phone: '',
      email: '',
    },
  });

  useEffect(() => {
    initializeStorage();
    loadLocations();
  }, []);

  const loadLocations = () => {
    const data = getAll<Location>(STORAGE_KEYS.LOCATIONS);
    setLocations(data);
    setFilteredLocations(data);
  };

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredLocations(
        locations.filter(
          (l) =>
            l.name.toLowerCase().includes(term) ||
            l.address.city.toLowerCase().includes(term) ||
            l.address.neighborhood.toLowerCase().includes(term)
        )
      );
    } else {
      setFilteredLocations(locations);
    }
  }, [searchTerm, locations]);

  const handleCepBlur = async () => {
    const cep = form.getValues('cep');
    if (cep.replace(/\D/g, '').length === 8) {
      setIsLoadingCep(true);
      const address = await fetchAddressByCep(cep);
      setIsLoadingCep(false);

      if (address) {
        form.setValue('street', address.street);
        form.setValue('neighborhood', address.neighborhood);
        form.setValue('city', address.city);
        form.setValue('state', address.state);
      }
    }
  };

  const openDialog = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      form.reset({
        name: location.name,
        type: location.type,
        cep: location.address.cep,
        street: location.address.street,
        number: location.address.number,
        complement: location.address.complement || '',
        neighborhood: location.address.neighborhood,
        city: location.address.city,
        state: location.address.state,
        phone: location.phone || '',
        email: location.email || '',
        lat: location.coordinates?.lat,
        lng: location.coordinates?.lng,
      });
    } else {
      setEditingLocation(null);
      form.reset();
    }
    setDialogOpen(true);
  };

  const onSubmit = (data: LocationFormData) => {
    const locationData = {
      name: data.name,
      type: data.type,
      address: {
        cep: data.cep,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
      },
      coordinates: data.lat && data.lng ? { lat: data.lat, lng: data.lng } : undefined,
      phone: data.phone,
      email: data.email || undefined,
    };

    if (editingLocation) {
      update(STORAGE_KEYS.LOCATIONS, editingLocation.id, locationData);
      toast({ title: 'Local atualizado!', description: `${data.name} foi atualizado.` });
    } else {
      create(STORAGE_KEYS.LOCATIONS, locationData);
      toast({ title: 'Local criado!', description: `${data.name} foi adicionado.` });
    }

    setDialogOpen(false);
    loadLocations();
  };

  const handleDelete = (location: Location) => {
    setLocationToDelete(location);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (locationToDelete) {
      softDelete(STORAGE_KEYS.LOCATIONS, locationToDelete.id);
      loadLocations();
      toast({ title: 'Local excluído', description: `${locationToDelete.name} foi removido.` });
    }
    setDeleteDialogOpen(false);
    setLocationToDelete(null);
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
            <h1 className="text-3xl font-bold tracking-tight">Locais</h1>
            <p className="text-muted-foreground">Gerencie os locais de atendimento</p>
          </div>
          <Button onClick={() => openDialog()} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Novo Local
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, cidade ou bairro..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLocations.map((location) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="glass-card h-full transition-shadow hover:shadow-glow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{location.name}</CardTitle>
                        <Badge variant="outline" className={typeColors[location.type]}>
                          {typeLabels[location.type]}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openDialog(location)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(location)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>
                      {location.address.street}, {location.address.number}
                      {location.address.complement && ` - ${location.address.complement}`}
                      <br />
                      {location.address.neighborhood}, {location.address.city}/{location.address.state}
                    </span>
                  </div>
                  {location.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{location.phone}</span>
                    </div>
                  )}
                  {location.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{location.email}</span>
                    </div>
                  )}
                  {location.averageRating && (
                    <div className="flex items-center gap-1 pt-2">
                      <span className="text-warning">★</span>
                      <span className="font-medium">{location.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredLocations.length === 0 && (
          <div className="py-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">Nenhum local encontrado</h3>
            <p className="text-muted-foreground">Adicione um novo local para começar.</p>
          </div>
        )}

        {/* Form Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingLocation ? 'Editar Local' : 'Novo Local'}</DialogTitle>
              <DialogDescription>
                Preencha as informações do local de atendimento.
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
                        <Input {...field} placeholder="Nome do local" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="upa">UPA</SelectItem>
                          <SelectItem value="ubs">UBS</SelectItem>
                          <SelectItem value="hospital">Hospital</SelectItem>
                          <SelectItem value="clinica">Clínica</SelectItem>
                          <SelectItem value="pronto_socorro">Pronto Socorro</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input {...field} placeholder="00000-000" onBlur={handleCepBlur} />
                          {isLoadingCep && (
                            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Rua</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>UF</FormLabel>
                        <FormControl>
                          <Input {...field} maxLength={2} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="(11) 3333-3333" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="contato@local.com" />
                        </FormControl>
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
                    {editingLocation ? 'Salvar' : 'Criar'}
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
                Tem certeza que deseja excluir <strong>{locationToDelete?.name}</strong>?
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
