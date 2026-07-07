import { formatXAF, products } from '@/lib/data';

/**
 * SCULPT'AURA Admin — catalogue management.
 *
 * The full product list with price, stock and publication state. Stock at or
 * below 10 is flagged with an outlined pill; unpublished items are marked. The
 * "Nouveau produit" action opens the create form (wired in a later increment).
 */
export default function ProductsPage() {
  return (
    <main className="animate-fade-in px-8 py-12 lg:px-14">
      <header className="mb-10 flex items-end justify-between">
        <div>
          <p className="label-editorial-muted">Catalogue</p>
          <h1 className="mt-2 font-serif text-5xl italic text-neutral-900">
            Produits
          </h1>
        </div>
        <button type="button" className="btn-editorial">
          Nouveau produit
        </button>
      </header>

      <div className="overflow-x-auto card-editorial p-0">
        <table className="w-full min-w-[720px] border-collapse">
          <thead>
            <tr className="border-b border-neutral-100 text-left">
              <Th>Produit</Th>
              <Th>Catégorie</Th>
              <Th className="text-right">Prix</Th>
              <Th className="text-right">Stock</Th>
              <Th>État</Th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className="border-b border-neutral-50 last:border-0"
              >
                <Td>
                  <span className="font-serif text-lg italic text-neutral-900">
                    {p.name}
                  </span>
                  <span className="block font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-400">
                    {p.slug}
                  </span>
                </Td>
                <Td className="font-sans text-sm text-neutral-600">
                  {p.category}
                </Td>
                <Td className="text-right font-sans text-sm text-neutral-900">
                  {formatXAF(p.priceXAF)}
                </Td>
                <Td className="text-right">
                  <span
                    className={`font-sans text-sm ${
                      p.stock <= 10 ? 'text-neutral-900' : 'text-neutral-500'
                    }`}
                  >
                    {p.stock}
                  </span>
                  {p.stock <= 10 && (
                    <span className="ml-3 pill border-neutral-900 text-neutral-900">
                      Réassort
                    </span>
                  )}
                </Td>
                <Td>
                  {p.published ? (
                    <span className="pill border-neutral-900 bg-neutral-900 text-white">
                      Publié
                    </span>
                  ) : (
                    <span className="pill border-neutral-200 text-neutral-400">
                      Brouillon
                    </span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Th({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-6 py-4 font-sans text-[0.6rem] uppercase tracking-editorial text-neutral-400 ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-6 py-5 align-top ${className}`}>{children}</td>;
}
