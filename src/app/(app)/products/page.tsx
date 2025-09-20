
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, MoreVertical, LayoutGrid, List } from 'lucide-react';
import { mockProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import ProductFormDialog from './product-form-dialog';
import DeleteProductAlert from './delete-product-alert';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// convert UI payload -> API payload (same shape here, but keep helper)
const toApi = (p: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => ({
  name: p.name,
  quantity: p.quantity,
  rate: p.rate,
  rate_unit: p.rate_unit,
});

// convert API response -> UI Product
const fromApi = (p: any): Product => ({
  id: p.id,
  name: p.name,
  quantity: Number(p.quantity),
  rate: Number(p.rate),
  rate_unit: p.rate_unit ?? p.rateUnit,
  created_at: p.created_at ?? p.createdAt,
  updated_at: p.updated_at ?? p.updatedAt,
});

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const postCustomer = async () => {
      try {
        const response = await fetch('/api/products', {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        setProducts(data?.data);
        console.log('Customer saved:', data);
      } catch (err) {
        console.error('Failed to save customer:', err);
      }
    };

    postCustomer();

  }, []);

  const handleSaveProduct = async (
    product: Product,
    id?: string
  ) => {
    // optimistic snapshot (so we can roll back on error)
    let rollback: Product[] | null = null;

    try {
      if (id) {
        // ------- UPDATE -------
        // optimistic update
        rollback = null;
        setProducts(prev => {
          rollback = prev;
          return prev.map(p => (p.id === id ? { ...p, ...product } as Product : p));
        });

        const res = await fetch(`/api/products/${id}`, {
          method: 'PATCH', // or 'PUT' if that’s your route
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toApi(product)),
        });

        const json = await res.json();
        if (!res.ok || !json?.success) throw new Error(json?.error || 'Update failed');

        const updated = fromApi(json.data);
        // replace with canonical server version (timestamps etc.)
        setProducts(prev => prev.map(p => (p.id === id ? updated : p)));
        return updated;
      } else {
        // ------- CREATE -------
        // optimistic add (temporary id for UI only)
        const tempId = `tmp-${Date.now()}`;
        const optimistic: Product = {
          id: tempId,
          name: product.name,
          quantity: product.quantity,
          rate: product.rate,
          rate_unit: product.rate_unit,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        setProducts(prev => {
          rollback = prev;
          return [optimistic, ...prev];
        });

        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(toApi(product)),
        });

        const json = await res.json();
        if (!res.ok || !json?.success) throw new Error(json?.error || 'Create failed');

        const created = fromApi(json.data);

        // swap temp row with server row
        setProducts(prev => prev.map(p => (p.id === tempId ? created : p)));
        return created;
      }
    } catch (err) {
      console.error('handleSaveProduct error:', err);
      // rollback optimistic changes if we made any
      if (rollback) setProducts(rollback);
      throw err;
    }
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setIsAlertOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      // call your API
      const res = await fetch(`/api/products/${productToDelete}`, {
        method: 'DELETE',
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete product');
      }

      // update state only if delete succeeded
      setProducts(prev => prev.filter(p => p.id !== productToDelete));
      setProductToDelete(null);
    } catch (err) {
      console.error('Error deleting product:', err);
      // optionally show toast/alert here
    }
  };


  const handleOpenForm = (product: Product | null = null) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight font-headline">Products</h2>
          <p className="text-muted-foreground">View and manage your product inventory.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md bg-secondary p-1">
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setView('grid')}
              className={cn("h-8 w-8", view === 'grid' && "bg-background text-foreground shadow-sm")}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setView('list')}
              className={cn("h-8 w-8", view === 'list' && "bg-background text-foreground shadow-sm")}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => handleOpenForm()}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      <ProductFormDialog
        product={selectedProduct}
        onSave={handleSaveProduct}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
      />

      <DeleteProductAlert
        onDelete={handleDeleteProduct}
        open={isAlertOpen}
        onOpenChange={setIsAlertOpen}
      />

      {view === 'grid' ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <CardTitle className="text-lg font-semibold">{product.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenForm(product)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDeleteClick(product.id)} className="text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-grow">
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-foreground">₹{product.rate.toFixed(2)}</span> / {product.rate_unit}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Stock: <span className="font-bold text-foreground">{product.quantity}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Rent Price</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant={product.quantity > 0 ? 'secondary' : 'destructive'} className={cn(product.quantity > 10 && 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300')}>
                        {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                      </Badge>
                    </TableCell>
                    <TableCell>₹{product.rate.toFixed(2)} / {product.rate_unit}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleOpenForm(product)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(product.id)} className="text-destructive">
                            Delete
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
      )}
    </div>
  );
}
