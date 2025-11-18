import React, { useEffect, useState, useRef } from 'react';
import { Card, Form, Button, Table, Alert, InputGroup } from 'react-bootstrap';

const BRAND_API = 'http://localhost:4000/api/brands';

function BrandManager() {
  const [brands, setBrands] = useState([]);
  const [form, setForm] = useState({ name: '', img: '' });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    fetch(BRAND_API).then(res => res.json()).then(setBrands);
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = e => setFile(e.target.files[0]);

  const handleSubmit = async e => {
  e.preventDefault();
  setMessage('');
  const formData = new FormData();
  formData.append('name', form.name);

  // If new file selected, append as file
  if (file) {
    formData.append('img', file);
  } else if (editingId && form.img) {
    // If editing and no new file, send previous img path as text
    formData.append('img', form.img);
  }

  const method = editingId ? 'PUT' : 'POST';
  const url = editingId ? `${BRAND_API}/${editingId}` : BRAND_API;
  try {
    const res = await fetch(url, {
      method,
      body: formData
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(editingId ? 'Brand updated!' : 'Brand created!');
      setForm({ name: '', img: '' });
      setFile(null);
      setEditingId(null);
      fileInputRef.current.value = '';
      fetch(BRAND_API).then(res => res.json()).then(setBrands);
    } else {
      setMessage(data.error || 'Error');
    }
  } catch {
    setMessage('Network error');
  }
};

  const handleEdit = b => {
    setForm({ name: b.name, img: b.img });
    setEditingId(b.id);
    setFile(null);
    setMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this brand?')) return;
    try {
      const res = await fetch(`${BRAND_API}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Brand deleted!');
        setBrands(brands.filter(b => b.id !== id));
      } else {
        setMessage('Delete failed');
      }
    } catch {
      setMessage('Network error');
    }
  };

  return (
    <Card style={{ boxShadow: '0 2px 16px #eee', borderRadius: 16, marginBottom: 32 }}>
      <Card.Body>
        <h3 style={{ fontWeight: 'bold', color: '#c81b84', textAlign: 'center' }}>
          {editingId ? 'Edit Brand' : 'Create Brand'}
        </h3>
        {message && (
          <Alert variant={message.includes('error') ? 'danger' : 'success'} className="mb-3" dismissible onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}
        <Form onSubmit={handleSubmit} encType="multipart/form-data">
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control name="name" value={form.name} onChange={handleChange} required placeholder="Brand Name" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Image</Form.Label>
            <InputGroup>
              <Form.Control
                type="file"
                name="img"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
              {(file || form.img) && (
                <InputGroup.Text>
                  <img
                    src={file ? URL.createObjectURL(file) : form.img}
                    alt="preview"
                    style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 8 }}
                  />
                </InputGroup.Text>
              )}
            </InputGroup>
            {editingId && !file && form.img && (
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                Current: <img src={form.img} alt="current" style={{ width: 24, height: 24, borderRadius: 4 }} />
              </div>
            )}
          </Form.Group>
          <div className="d-grid gap-2">
            <Button type="submit" variant="primary" size="lg">
              {editingId ? 'Update' : 'Create'}
            </Button>
            {editingId && (
              <Button variant="secondary" size="lg" onClick={() => { setEditingId(null); setForm({ name: '', img: '' }); setFile(null); fileInputRef.current.value = ''; }}>
                Cancel
              </Button>
            )}
          </div>
        </Form>
        <h4 style={{ fontWeight: 'bold', margin: '32px 0 16px' }}>Brand List</h4>
        <Table responsive bordered hover border="1" style={{ borderRadius: 8, overflow: 'hidden' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Image</th>
              <th style={{ textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map(b => (
              <tr key={b.id}>
                <td style={{ verticalAlign: 'middle' }}>{b.name}</td>
                <td style={{ verticalAlign: 'middle' }}>
                  <img src={`http://localhost:3000${b.img.replace('./', '/')}`} alt={b.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                </td>
                <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                  <Button size="sm" variant="warning" className="me-2" onClick={() => handleEdit(b)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(b.id)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}

export default BrandManager;