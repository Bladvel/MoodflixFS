import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api-endpoints';
import Navbar from '../components/Navbar';
import { useTranslation } from '../lib/language-context';

export default function XmlManagementPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [xmlPreview, setXmlPreview] = useState<string | null>(null);

  const handleExportar = async () => {
    try {
      setLoading(true);
      setMessage(null);
      
      const xmlData = await api.xml.exportar();
      
      // Crear un blob y descargarlo
      const blob = new Blob([xmlData], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `catalogo-productos-${new Date().toISOString().split('T')[0]}.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setMessage({ type: 'success', text: t('xmlManagement.exportSuccess') });
      setXmlPreview(xmlData.substring(0, 500) + '...');
    } catch (err: any) {
      console.error('Error exportando XML:', err);
      setMessage({ type: 'error', text: err.message || t('xmlManagement.exportError') });
    } finally {
      setLoading(false);
    }
  };

  const handleImportar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xml')) {
      setMessage({ type: 'error', text: t('xmlManagement.invalidFileType') });
      return;
    }

    if (!confirm(t('xmlManagement.importConfirm'))) {
      event.target.value = '';
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      
      const xmlData = await file.text();
      const resultado = await api.xml.importar(xmlData);
      
      setMessage({ type: 'success', text: resultado });
      
      // Limpiar el input
      event.target.value = '';
      
      // Recargar productos después de 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      console.error('Error importando XML:', err);
      setMessage({ type: 'error', text: err.message || t('xmlManagement.importError') });
      event.target.value = '';
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/backup')}
            className="text-purple-600 hover:text-purple-800 mb-4 flex items-center gap-2"
          >
            ← {t('common.back')}
          </button>
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            📄 {t('xmlManagement.title')}
          </h1>
          <p className="text-gray-600">
            {t('xmlManagement.subtitle')}
          </p>
        </div>

        {/* Mensajes */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Tarjetas de acciones */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Exportar XML */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                📤
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {t('xmlManagement.export')}
                </h2>
                <p className="text-sm text-gray-600">
                  {t('xmlManagement.exportDescription')}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleExportar}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.loading') : t('xmlManagement.exportButton')}
            </button>
          </div>

          {/* Importar XML */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">
                📥
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {t('xmlManagement.import')}
                </h2>
                <p className="text-sm text-gray-600">
                  {t('xmlManagement.importDescription')}
                </p>
              </div>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                ⚠️ {t('xmlManagement.importWarning')}
              </p>
            </div>
            
            <label className="block">
              <input
                type="file"
                accept=".xml"
                onChange={handleImportar}
                disabled={loading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-3 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-orange-600 file:text-white
                  hover:file:bg-orange-700
                  file:cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </label>
          </div>
        </div>

        {/* Vista previa del XML */}
        {xmlPreview && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              {t('xmlManagement.preview')}
            </h3>
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-xs">
              <code>{xmlPreview}</code>
            </pre>
          </div>
        )}

        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">
            ℹ️ {t('xmlManagement.infoTitle')}
          </h3>
          <ul className="list-disc list-inside space-y-2 text-blue-800">
            <li>{t('xmlManagement.info1')}</li>
            <li>{t('xmlManagement.info2')}</li>
            <li>{t('xmlManagement.info3')}</li>
            <li>{t('xmlManagement.info4')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
