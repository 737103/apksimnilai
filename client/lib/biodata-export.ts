import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generateBiodataWord(student: any) {
  try {
    // Create a temporary container for the biodata
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm'; // A4 width
    container.style.backgroundColor = 'white';
    container.style.padding = '20mm';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '12px';
    container.style.lineHeight = '1.4';
    
    // Create the biodata content
    container.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-size: 16px; font-weight: bold; margin: 0;">DATA DIRI PESERTA DIDIK</h1>
      </div>
      
      <div style="display: flex; gap: 20px; margin-bottom: 30px;">
        <div style="flex: 1;">
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>1. Nama Lengkap Siswa</strong> : ${student.namaLengkap || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>2. Tempat Lahir</strong> : ${student.tempatLahir || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>3. Tanggal Lahir</strong> : ${student.tanggalLahir || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>4. NISN</strong> : ${student.nisn || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>5. NIS</strong> : ${student.nis || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>6. Jenis Kelamin</strong> : ${student.jenisKelamin || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>7. Agama</strong> : ${student.agama || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>8. Jumlah Saudara</strong> : _________________</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>9. Anak Ke</strong> : ${student.anakKe || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>10. Asal Sekolah</strong> : _________________</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>11. Diterima di sekolah ini</strong></p>
            <p style="margin: 5px 0 5px 20px; font-size: 12px;">a. Dikelas : ${student.diterimaDiKelas || '_________________'}</p>
            <p style="margin: 5px 0 5px 20px; font-size: 12px;">b. Pada tanggal : ${student.diterimaPadaTanggal || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>12. Nama Orang Tua</strong></p>
            <p style="margin: 5px 0 5px 20px; font-size: 12px;">a. Ayah : ${student.namaAyah || '_________________'}</p>
            <p style="margin: 5px 0 5px 20px; font-size: 12px;">b. Ibu : ${student.namaIbu || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>13. Alamat Domisili</strong> : ${student.alamatDomisili || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>14. Alamat Orang tua</strong> : ${student.alamatOrtu || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>15. Nomor Telepon/WA orang tua</strong> : ${student.noTeleponOrtu || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>16. Pekerjaan Orang Tua</strong></p>
            <p style="margin: 5px 0 5px 20px; font-size: 12px;">a. Ayah : ${student.pekerjaanAyah === 'Lainnya' ? student.pekerjaanAyahLain : student.pekerjaanAyah || '_________________'}</p>
            <p style="margin: 5px 0 5px 20px; font-size: 12px;">b. Ibu : ${student.pekerjaanIbu === 'Lainnya' ? student.pekerjaanIbuLain : student.pekerjaanIbu || '_________________'}</p>
          </div>
          
          ${student.namaWali ? `
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>17. Nama Wali</strong> : ${student.namaWali}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>18. Alamat Wali</strong> : ${student.alamatWali || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>19. Nomor Telepon/WA Wali</strong> : ${student.noTeleponWali || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>20. Pekerjaan Wali</strong> : ${student.pekerjaanWali === 'Lainnya' ? student.pekerjaanWaliLain : student.pekerjaanWali || '_________________'}</p>
          </div>
          ` : `
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>17. Nama Wali</strong> : _________________</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>18. Alamat Wali</strong> : _________________</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>19. Nomor Telepon/WA Wali</strong> : _________________</p>
          </div>
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>20. Pekerjaan Wali</strong> : _________________</p>
          </div>
          `}
          
          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 12px;"><strong>21. Keterangan Lainnya</strong> : _________________</p>
          </div>
        </div>
        
        <div style="width: 120px; flex-shrink: 0; text-align: center;">
          <div style="border: 1px solid #000; width: 100px; height: 120px; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; background-color: #f9f9f9;">
            ${student.foto ? `<img src="${student.foto}" style="max-width: 100%; max-height: 100%; object-fit: cover;" alt="Foto Siswa" />` : '<span style="color: #666; font-size: 10px; text-align: center;">Pas Foto</span>'}
          </div>
          <p style="margin: 0; font-size: 10px;">3 x 4</p>
          <p style="margin: 0; font-size: 10px; color: #ff0000; text-decoration: underline;">Berwarna</p>
        </div>
      </div>
      
      <div style="display: flex; justify-content: flex-end; margin-top: 40px;">
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 12px;">Enrekang, 4 Oktober 2025</p>
          <p style="margin: 10px 0 5px 0; font-size: 12px;">An. Kepala Sekolah,</p>
          <p style="margin: 5px 0; font-size: 12px;">Wali Kelas</p>
          <div style="height: 40px; margin: 20px 0;"></div>
          <p style="margin: 0; font-size: 12px; text-decoration: underline;">Asrah Abu, S.Pd</p>
          <p style="margin: 5px 0 0 0; font-size: 12px;">NIP: _________________</p>
        </div>
      </div>
    `;
    
    // Add container to document
    document.body.appendChild(container);
    
    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    // Remove container from document
    document.body.removeChild(container);
    
    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    // Save the PDF
    const fileName = `Biodata_${student.namaLengkap || 'Siswa'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
  } catch (error) {
    console.error('Error generating biodata:', error);
    throw new Error('Gagal membuat dokumen biodata');
  }
}