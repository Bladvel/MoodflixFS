import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { backupAPI } from '../lib/api-endpoints';
import { useTranslation } from '../lib/language-context';

const BackupPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleGenerarBackup = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      console.log('Generando backup...');
      const blob = await backupAPI.generar();
      console.log('Backup generado, tamaño:', blob.size);
      
      // Crear un link para descargar el archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_${new Date().toISOString().split('T')[0]}.bak`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessage(t('backupPage.backupGenerated'));
    } catch (err: any) {
      console.error('Error al generar backup:', err);
      setError(err.Message || err.message || t('backupPage.generateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setMessage('');
      setError('');
    }
  };

  const handleRestaurar = async () => {
    if (!selectedFile) {
      setError(t('backupPage.selectFileError'));
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      await backupAPI.restaurarDesdeArchivo(selectedFile);
      setMessage(t('backupPage.backupRestored'));
      setSelectedFile(null);
      // Limpiar el input file
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      setError(err.Message || err.message || t('backupPage.restoreError'));
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarSeleccion = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setMessage('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {t('backupPage.title')}
          </h1>
          <button
            onClick={() => navigate('/xml-management')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
          >
            📄 {t('xmlManagement.title')}
          </button>
        </div>

        {/* Mensajes */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Generar Backup */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {t('backupPage.generateBackup')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('backupPage.generateBackupDescription')}
          </p>
          <button
            onClick={handleGenerarBackup}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('backupPage.generating') : t('backupPage.generateButton')}
          </button>
        </div>

        {/* Hacer Restore */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {t('backupPage.makeRestore')}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('backupPage.makeRestoreDescription')}
          </p>

          <div className="space-y-4">
            {/* Selector de archivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('backupPage.filePath')}
              </label>
              <div className="flex space-x-2">
                <input
                  id="fileInput"
                  type="file"
                  accept=".bak,.sql"
                  onChange={handleFileChange}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none"
                />
                {selectedFile && (
                  <button
                    onClick={handleEliminarSeleccion}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    {t('backupPage.remove')}
                  </button>
                )}
              </div>
              {selectedFile && (
                <p className="text-sm text-gray-600 mt-2">
                  {t('backupPage.fileSelected')} {selectedFile.name}
                </p>
              )}
            </div>

            {/* Botón de restaurar */}
            <button
              onClick={handleRestaurar}
              disabled={loading || !selectedFile}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('backupPage.restoring') : t('backupPage.startRestore')}
            </button>
          </div>
        </div>

        {/* Advertencia */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-yellow-600 text-xl">⚠️</span>
            <div>
              <h3 className="font-semibold text-yellow-800 mb-1">{t('backupPage.warningTitle')}</h3>
              <p className="text-sm text-yellow-700">
                {t('backupPage.warningMessage')}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BackupPage;
