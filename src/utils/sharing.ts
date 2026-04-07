import html2canvas from 'html2canvas';

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    return true;
  } catch {
    return false;
  }
}

export function shareWhatsApp(text: string): void {
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

export function shareEmail(text: string): void {
  const subject = encodeURIComponent('Cotizacion WIEMX Exchange');
  const body = encodeURIComponent(text);
  location.href = `mailto:?subject=${subject}&body=${body}`;
}

export async function downloadAsImage(element: HTMLElement): Promise<boolean> {
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: '#0f172a',
      scale: 2,
      useCORS: true,
    });
    const a = document.createElement('a');
    a.download = `cotizacion-wiemx-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    return true;
  } catch {
    return false;
  }
}
