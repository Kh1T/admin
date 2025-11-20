import React, { useEffect, useState, useRef } from 'react';
import { Card, Form, Button, Table, Alert, InputGroup } from 'react-bootstrap';

const CATEGORY_API = 'http://localhost:4000/api/categories';

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', img: '' });
  const [file, setFile] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef();

  useEffect(() => {
    fetch(CATEGORY_API).then(res => res.json()).then(setCategories);
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = e => setFile(e.target.files[0]);

  const handleSubmit = async e => {
    e.preventDefault();
    setMessage('');
    const formData = new FormData();
    formData.append('name', form.name);
    if (file) {
      formData.append('img', file);
    } else if (editingId && form.img) {
      formData.append('img', form.img);
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId ? `${CATEGORY_API}/${editingId}` : CATEGORY_API;
    try {
      const res = await fetch(url, {
        method,
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(editingId ? 'Category updated!' : 'Category created!');
        setForm({ name: '', img: '' });
        setFile(null);
        setEditingId(null);
        fileInputRef.current.value = '';
        fetch(CATEGORY_API).then(res => res.json()).then(setCategories);
      } else {
        setMessage(data.error || 'Error');
      }
    } catch {
      setMessage('Network error');
    }
  };

  const handleEdit = c => {
    setForm({ name: c.name, img: c.img });
    setEditingId(c.id);
    setFile(null);
    setMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this category?')) return;
    try {
      const res = await fetch(`${CATEGORY_API}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage('Category deleted!');
        setCategories(categories.filter(c => c.id !== id));
      } else {
        setMessage('Delete failed');
      }
    } catch {
      setMessage('Network error');
    }
  };

  return (
    <Card className="category-manager-card">
      <Card.Body>
        <h3 className="manager-title">
          {editingId ? 'Edit Category' : 'Create Category'}
        </h3>
        {message && (
          <Alert variant={message.includes('error') ? 'danger' : 'success'} className="mb-3" dismissible onClose={() => setMessage('')}>
            {message}
          </Alert>
        )}
        <Form onSubmit={handleSubmit} encType="multipart/form-data" className="manager-form">
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Category Name"
              className="form-control-custom"
            />
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
                className="form-control-custom"
              />
              <InputGroup.Text>
                {file || form.img ? (
                  <img
                    src={file ? URL.createObjectURL(file) : `http://localhost:4000${form.img.replace('./', '/')}`}
                    alt="preview"
                    className="image-preview"
                  />
                ) : (
                  <div className="image-preview-placeholder">No Image</div>
                )}
              </InputGroup.Text>
            </InputGroup>
            {editingId && !file && form.img && (
              <div className="current-image-info">
                Current: <img src={`http://localhost:4000${form.img.replace('./', '/')}`} alt="current" className="current-image-thumb" />
              </div>
            )}
          </Form.Group>
          <div className="form-buttons">
            <Button type="submit" variant="primary" className="btn-submit">
              {editingId ? 'Update Category' : 'Create Category'}
            </Button>
            {editingId && (
              <Button
                variant="secondary"
                className="btn-cancel"
                onClick={() => {
                  setEditingId(null);
                  setForm({ name: '', img: '' });
                  setFile(null);
                  fileInputRef.current.value = '';
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </Form>
        <h4 className="list-title">Category List</h4>
        <div className="table-container">
          <Table responsive bordered hover className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Image</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(categories || []).map(c => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>
                    <img
                      src={`http://localhost:3000${c.img.replace('./', '/')}`}
                      alt={c.name}
                      className="table-image"
                    />
                  </td>
                  <td className="text-center action-buttons">
                    <Button size="sm" variant="warning" className="btn-edit me-2" onClick={() => handleEdit(c)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" className="btn-delete" onClick={() => handleDelete(c.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
}

export default CategoryManager;