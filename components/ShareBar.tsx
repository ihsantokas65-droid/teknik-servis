import Link from "next/link";

export function ShareBar({ url, title }: { url: string; title: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const items = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`
    },
    {
      label: "X",
      href: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    },
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    }
  ];

  return (
    <div>
      <div className="muted" style={{ fontSize: 13, fontWeight: 950 }}>
        Paylaş
      </div>
      <div className="shareRow" style={{ marginTop: 10 }}>
        {items.map((it) => (
          <Link key={it.label} className="chip focus-ring" href={it.href} target="_blank" rel="noreferrer">
            {it.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

