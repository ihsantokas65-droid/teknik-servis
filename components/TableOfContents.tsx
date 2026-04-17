import Link from "next/link";

export type TocItem = {
  id: string;
  label: string;
};

export function TableOfContents({ items }: { items: TocItem[] }) {
  if (!items.length) return null;
  return (
    <div>
      <div className="muted" style={{ fontSize: 13, fontWeight: 950 }}>
        İçindekiler
      </div>
      <ol className="tocList">
        {items.map((it) => (
          <li key={it.id}>
            <Link className="focus-ring" href={`#${it.id}`}>
              {it.label}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

