import Link from "next/link";

export type Crumb = { href: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="muted" style={{ fontSize: 14, marginBottom: 12 }}>
      {items.map((c, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={c.href}>
            {idx > 0 ? <span aria-hidden> / </span> : null}
            <Link 
              href={c.href} 
              aria-current={isLast ? "page" : undefined}
              style={{ color: isLast ? "var(--text)" : "inherit", fontWeight: isLast ? 700 : 400 }}
            >
              {c.label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}

