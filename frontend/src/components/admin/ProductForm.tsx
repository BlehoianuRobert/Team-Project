import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Product, ProductRequest } from '../../types';
import { productService } from '../../services/productService';
import { uploadService } from '../../services/uploadService';
import {
  getImageUrl,
  PRODUCT_IMAGE_GALLERY_SEP,
  splitProductImageGallery,
} from '../../utils/imageHelper';
import './ProductForm.css';

const MAX_IMAGE_URL_FIELD_CHARS = 1000;

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

type ImageInputMode = 'url' | 'upload' | 'camera';

const validateImageFile = (file: File): string | null => {
  if (!file.type.startsWith('image/')) {
    return 'Fișierul trebuie să fie o imagine (JPG, PNG, etc.)';
  }
  if (file.size > 10 * 1024 * 1024) {
    return 'Fișierul este prea mare. Dimensiunea maximă este 10MB.';
  }
  return null;
};

const ProductForm: React.FC<ProductFormProps> = ({ product, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<ProductRequest>({
    name: '',
    description: '',
    dailyPrice: 0,
    category: '',
    brand: '',
    model: '',
    imageUrl: '',
    discountPercent: 0,
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageMode, setImageMode] = useState<ImageInputMode>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const formDataRef = useRef(formData);
  const [cameraStarting, setCameraStarting] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);
  
  // Filter suggestions
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  
  // Dropdown visibility
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  
  // Filtered suggestions based on input
  const [filteredCategories, setFilteredCategories] = useState<string[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<string[]>([]);
  const [filteredModels, setFilteredModels] = useState<string[]>([]);

  useEffect(() => {
    loadFilterSuggestions();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        dailyPrice: product.dailyPrice,
        category: product.category || '',
        brand: product.brand || '',
        model: product.model || '',
        imageUrl: product.imageUrl || '',
        discountPercent: product.discountPercent || 0,
      });
      
    }
  }, [product]);

  useEffect(() => {
    if (formData.category) {
      loadBrandSuggestions(formData.category);
    } else {
      loadBrandSuggestions();
    }
  }, [formData.category]);

  useEffect(() => {
    if (formData.category && formData.brand) {
      loadModelSuggestions(formData.category, formData.brand);
    } else {
      loadModelSuggestions();
    }
  }, [formData.category, formData.brand]);

  const loadFilterSuggestions = async () => {
    try {
      const [cats, brs, mods] = await Promise.all([
        productService.getCategories(),
        productService.getBrands(),
        productService.getModels(),
      ]);
      setCategories(cats);
      setBrands(brs);
      setModels(mods);
      setFilteredCategories(cats);
      setFilteredBrands(brs);
      setFilteredModels(mods);
    } catch (error) {
      console.error('Error loading filter suggestions:', error);
    }
  };

  const loadBrandSuggestions = async (category?: string) => {
    try {
      const brs = category 
        ? await productService.getBrands(category)
        : await productService.getBrands();
      setBrands(brs);
      setFilteredBrands(brs);
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  };

  const loadModelSuggestions = async (category?: string, brand?: string) => {
    try {
      const mods = (category && brand)
        ? await productService.getModels(category, brand)
        : await productService.getModels();
      setModels(mods);
      setFilteredModels(mods);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const galleryPaths = splitProductImageGallery(formData.imageUrl);

  const removeGalleryAt = (index: number) => {
    setFormData((prev) => {
      const cur = splitProductImageGallery(prev.imageUrl);
      cur.splice(index, 1);
      return { ...prev, imageUrl: cur.join(PRODUCT_IMAGE_GALLERY_SEP) };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'dailyPrice' || name === 'discountPercent' ? parseFloat(value) || 0 : value,
    }));

    // Filter suggestions based on input
    if (name === 'category') {
      setShowCategoryDropdown(true);
      const filtered = categories.filter(cat => 
        cat.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else if (name === 'brand') {
      setShowBrandDropdown(true);
      const filtered = brands.filter(br => 
        br.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredBrands(filtered);
    } else if (name === 'model') {
      setShowModelDropdown(true);
      const filtered = models.filter(mod => 
        mod.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredModels(filtered);
    }
  };

  const handleSelectSuggestion = (field: 'category' | 'brand' | 'model', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    if (field === 'category') {
      setShowCategoryDropdown(false);
      loadBrandSuggestions(value);
    } else if (field === 'brand') {
      setShowBrandDropdown(false);
      if (formData.category) {
        loadModelSuggestions(formData.category, value);
      }
    } else if (field === 'model') {
      setShowModelDropdown(false);
    }
  };

  const stopCameraStream = useCallback(() => {
    cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    cameraStreamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => stopCameraStream();
  }, [stopCameraStream]);

  const uploadGalleryFile = async (file: File, opts?: { clearFileInput?: boolean }) => {
    const validation = validateImageFile(file);
    if (validation) {
      setError(validation);
      return;
    }

    setUploadingImage(true);
    setError('');
    setSuccessMessage('');

    try {
      const imagePath = (await uploadService.uploadImage(file)).trim();
      const cur = splitProductImageGallery(formDataRef.current.imageUrl);
      if (cur.includes(imagePath)) {
        setSuccessMessage('Această imagine este deja în galerie.');
        setTimeout(() => setSuccessMessage(''), 3000);
        setSelectedFile(null);
        if (opts?.clearFileInput !== false && imageFileInputRef.current) {
          imageFileInputRef.current.value = '';
        }
        return;
      }
      const joined = [...cur, imagePath].join(PRODUCT_IMAGE_GALLERY_SEP);
      if (joined.length > MAX_IMAGE_URL_FIELD_CHARS) {
        setError(
          `Galeria depășește ${MAX_IMAGE_URL_FIELD_CHARS} caractere (limită în baza de date). Ștergeți o imagine.`
        );
        setSelectedFile(null);
        if (opts?.clearFileInput !== false && imageFileInputRef.current) {
          imageFileInputRef.current.value = '';
        }
        return;
      }

      setFormData((prev) => ({ ...prev, imageUrl: joined }));
      formDataRef.current = { ...formDataRef.current, imageUrl: joined };
      setSuccessMessage(`Imagine adăugată. Galerie: ${cur.length + 1} poze.`);
      setTimeout(() => setSuccessMessage(''), 4000);

      setSelectedFile(null);
      if (opts?.clearFileInput !== false && imageFileInputRef.current) {
        imageFileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Eroare la încărcarea imaginii';
      setError(errorMsg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validateImageFile(file);
    if (validation) {
      setError(validation);
      return;
    }
    setSelectedFile(file);
    setError('');
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return;
    await uploadGalleryFile(selectedFile);
  };

  const startCamera = async (mode?: 'environment' | 'user') => {
    const useMode = mode ?? facingMode;
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        'Browserul nu suportă camera web. Folosiți „Camera telefonului” sau tab-ul „Încarcă fișier”, sau un browser actualizat (HTTPS sau localhost).'
      );
      return;
    }
    stopCameraStream();
    setError('');
    setCameraStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: useMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      cameraStreamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
      }
      setCameraActive(true);
    } catch {
      setError(
        'Nu s-a putut porni camera (permisiuni refuzate sau dispozitiv indisponibil). Încercați „Camera telefonului” sau tab-ul „Încarcă fișier”.'
      );
    } finally {
      setCameraStarting(false);
    }
  };

  const flipCameraFacing = async () => {
    const next = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(next);
    await startCamera(next);
  };

  const capturePhotoFromCamera = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      setError('Camera nu e gata. Așteptați previzualizarea sau reporniți camera.');
      return;
    }
    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) {
      setError('Nu s-a putut citi dimensiunea imaginii. Reporniți camera.');
      return;
    }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setError('Eroare la captură. Încercați alt browser.');
      return;
    }
    ctx.drawImage(video, 0, 0, w, h);
    const blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92)
    );
    if (!blob) {
      setError('Captura a eșuat. Încercați din nou.');
      return;
    }
    const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
    await uploadGalleryFile(file, { clearFileInput: false });
  };

  const handleNativeCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    void uploadGalleryFile(file, { clearFileInput: false });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate required filter fields
    if (!formData.category || !formData.category.trim()) {
      setError('Tipul produsului (Categorie) este obligatoriu pentru filtrare.');
      return;
    }
    
    if (!formData.brand || !formData.brand.trim()) {
      setError('Brand-ul este obligatoriu pentru filtrare.');
      return;
    }
    
    if (!formData.model || !formData.model.trim()) {
      setError('Modelul este obligatoriu pentru filtrare.');
      return;
    }
    
    setIsSubmitting(true);

    try {
      // Trim whitespace from filter fields
      const submitData = {
        ...formData,
        category: formData.category.trim(),
        brand: formData.brand.trim(),
        model: formData.model.trim(),
      };
      
      if (product) {
        await productService.updateProduct(product.id, submitData);
      } else {
        await productService.createProduct(submitData);
      }
      onSuccess();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Eroare la salvarea produsului';
      
      // Check if it's a data truncation error for image URL
      if (errorMessage.includes('image_url') || errorMessage.includes('too long')) {
        setError('URL-ul imaginii este prea lung. Dacă folosiți o imagine base64, vă rugăm să folosiți un serviciu de hosting de imagini (ex: Imgur, Cloudinary) sau să reduceți dimensiunea imaginii.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="product-form-overlay" onClick={onCancel}>
      <div className="product-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h2>{product ? 'Editează Produs' : 'Adaugă Produs Nou'}</h2>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          {error && <div className="alert alert-error">{error}</div>}
          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <div className="form-group">
            <label className="form-label">Nume Produs *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descriere *</label>
            <textarea
              name="description"
              className="form-input form-textarea"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="form-section-header">
            <h3>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              Informații pentru Filtrare
            </h3>
            <p className="section-description">
              Aceste câmpuri sunt obligatorii și vor fi folosite pentru filtrarea produselor de către clienți.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">
              Tip Produs (Categorie) *
              <span className="field-hint">ex: Camera, Smartphone, PlayStation 5, Laptop</span>
            </label>
            <div className="autocomplete-wrapper">
              <input
                type="text"
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleChange}
                onFocus={() => setShowCategoryDropdown(true)}
                onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                placeholder="Selectează sau introdu tipul produsului (ex: Camera, Smartphone, PS5)"
                required
                autoComplete="off"
              />
              {showCategoryDropdown && filteredCategories.length > 0 && (
                <div className="autocomplete-dropdown">
                  {filteredCategories.map((cat) => (
                    <div
                      key={cat}
                      className="autocomplete-option"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectSuggestion('category', cat);
                      }}
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <small className="form-hint">
              💡 Selectează din listă sau introdu un tip nou. Acest câmp este obligatoriu pentru filtrare.
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Brand (Marca) *
                <span className="field-hint">ex: Sony, Apple, Samsung</span>
              </label>
              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  name="brand"
                  className="form-input"
                  value={formData.brand}
                  onChange={handleChange}
                  onFocus={() => setShowBrandDropdown(true)}
                  onBlur={() => setTimeout(() => setShowBrandDropdown(false), 200)}
                  placeholder="Selectează sau introdu marca (ex: Sony, Apple)"
                  required
                  autoComplete="off"
                />
                {showBrandDropdown && filteredBrands.length > 0 && (
                  <div className="autocomplete-dropdown">
                    {filteredBrands.map((br) => (
                      <div
                        key={br}
                        className="autocomplete-option"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectSuggestion('brand', br);
                        }}
                      >
                        {br}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <small className="form-hint">
                Brand-ul produsului. Obligatoriu pentru filtrare.
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">
                Model *
                <span className="field-hint">ex: Alpha 7 III, iPhone 15 Pro</span>
              </label>
              <div className="autocomplete-wrapper">
                <input
                  type="text"
                  name="model"
                  className="form-input"
                  value={formData.model}
                  onChange={handleChange}
                  onFocus={() => setShowModelDropdown(true)}
                  onBlur={() => setTimeout(() => setShowModelDropdown(false), 200)}
                  placeholder="Selectează sau introdu modelul (ex: Alpha 7 III)"
                  required
                  autoComplete="off"
                />
                {showModelDropdown && filteredModels.length > 0 && (
                  <div className="autocomplete-dropdown">
                    {filteredModels.map((mod) => (
                      <div
                        key={mod}
                        className="autocomplete-option"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectSuggestion('model', mod);
                        }}
                      >
                        {mod}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <small className="form-hint">
                Modelul specific al produsului. Obligatoriu pentru filtrare.
              </small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Preț pe zi (RON) *</label>
              <input
                type="number"
                name="dailyPrice"
                className="form-input"
                value={formData.dailyPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                Reducere produs (%)
                <span style={{ fontSize: '0.75rem', fontWeight: 'normal', marginLeft: '0.5rem', color: 'var(--text-secondary)' }}>
                  (doar pentru proprietar)
                </span>
              </label>
              <input
                type="number"
                name="discountPercent"
                className="form-input"
                value={formData.discountPercent || 0}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                placeholder="0"
              />
              <small className="form-hint">
                Setează o reducere procentuală pentru acest produs (ex: 20 pentru 20% reducere)
              </small>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Imagine Produs</label>
            
            <div className="image-input-tabs image-input-tabs-3">
              <button
                type="button"
                className={`tab-btn ${imageMode === 'url' ? 'active' : ''}`}
                onClick={() => {
                  stopCameraStream();
                  setImageMode('url');
                  setSelectedFile(null);
                }}
              >
                URL / Base64
              </button>
              <button
                type="button"
                className={`tab-btn ${imageMode === 'upload' ? 'active' : ''}`}
                onClick={() => {
                  stopCameraStream();
                  setImageMode('upload');
                }}
              >
                Încarcă Fișier
              </button>
              <button
                type="button"
                className={`tab-btn ${imageMode === 'camera' ? 'active' : ''}`}
                onClick={() => setImageMode('camera')}
              >
                Cameră live
              </button>
            </div>

            {/* URL/Base64 Input Mode */}
            {imageMode === 'url' && (
              <div className="image-input-section">
                <input
                  type="text"
                  name="imageUrl"
                  className="form-input"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg sau data:image/png;base64,... sau /images/filename.jpg"
                />
                <small className="form-hint">
                  Puteți folosi: URL extern, Base64, sau cale /images/.... Mai multe imagini: separator{' '}
                  <code>{PRODUCT_IMAGE_GALLERY_SEP}</code> între căi, sau încărcați pe rând din tab-ul „Încarcă
                  Fișier”.
                </small>
              </div>
            )}

            {/* File Upload Mode */}
            {imageMode === 'upload' && (
              <div className="image-input-section">
                <p className="form-hint" style={{ marginBottom: '0.75rem' }}>
                  Aici nu e nevoie de URL sau Base64: alegeți fișierul de pe calculator și apăsați „Încarcă imagine”.
                  Formate acceptate: JPG, PNG, GIF, WEBP.
                </p>
                <div className="file-upload-area">
                  <input
                    ref={imageFileInputRef}
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="file-input"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-upload" className="file-upload-label">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>{selectedFile ? selectedFile.name : 'Selectează imagine'}</span>
                  </label>
                  
                  {selectedFile && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={handleUploadImage}
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? 'Se încarcă...' : 'Încarcă Imagine'}
                    </button>
                  )}
                </div>
                {selectedFile && (
                  <small className="form-hint">
                    Fișier selectat: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB). Apăsați
                    „Încarcă imagine” pentru a o adăuga la galerie (nu înlocuiește celelalte).
                  </small>
                )}
              </div>
            )}

            {imageMode === 'camera' && (
              <div className="image-input-section product-form-camera">
                <p className="form-hint product-form-camera-intro">
                  Previziune live din cameră; la „Fotografiază” se trimite un JPEG pe server ca la upload. Pe telefon,
                  dacă browserul blochează camera web, folosiți „Camera telefonului (nativ)”.
                </p>
                <input
                  ref={nativeCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleNativeCameraChange}
                  className="file-input"
                  style={{ display: 'none' }}
                  aria-hidden="true"
                />
                <div className="product-form-camera-preview-wrap">
                  <video
                    ref={videoRef}
                    className="product-form-camera-video"
                    playsInline
                    muted
                    autoPlay
                    aria-label="Previzualizare cameră"
                  />
                </div>
                <div className="product-form-camera-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => void startCamera()}
                    disabled={cameraStarting || uploadingImage}
                  >
                    {cameraStarting ? 'Se pornește…' : 'Pornește camera'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => nativeCameraInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    Camera telefonului (nativ)
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => void flipCameraFacing()}
                    disabled={cameraStarting || uploadingImage || !cameraActive}
                  >
                    Față / spate
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={stopCameraStream}>
                    Oprește camera
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => void capturePhotoFromCamera()}
                    disabled={uploadingImage || !cameraActive}
                  >
                    {uploadingImage ? 'Se încarcă…' : 'Fotografiază și adaugă'}
                  </button>
                </div>
              </div>
            )}

            {galleryPaths.length > 0 && (
              <div className="image-preview-grid">
                {galleryPaths.map((path, idx) => (
                  <div key={`${path}-${idx}`} className="image-preview">
                    <img src={getImageUrl(path)} alt={`Poze ${idx + 1}`} />
                    <button
                      type="button"
                      className="remove-preview-btn"
                      onClick={() => removeGalleryAt(idx)}
                      aria-label={`Șterge imaginea ${idx + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Anulează
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Se salvează...' : product ? 'Actualizează' : 'Creează'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
