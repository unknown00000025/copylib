import { readCopies, writeCopies } from '../../lib/store';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const copies = readCopies();
    return res.status(200).json(copies);
  }

  if (req.method === 'POST') {
    const copies = readCopies();
    const newCopy = { ...req.body, id: `copy_${Date.now()}` };
    copies.unshift(newCopy);
    writeCopies(copies);
    return res.status(200).json(newCopy);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const copies = readCopies().filter(c => c.id !== id);
    writeCopies(copies);
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
