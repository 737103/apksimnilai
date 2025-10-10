import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Function to format date properly
function formatDate(dateString: string | undefined): string {
  if (!dateString) return '_________________';
  
  try {
    // Handle different date formats
    let date: Date;
    
    // If it's already a Date object or ISO string
    if (dateString instanceof Date) {
      date = dateString;
    } else if (typeof dateString === 'string') {
      // Remove any timezone info that might cause issues
      const cleanDateString = dateString.replace(/T.*Z?$/, '');
      date = new Date(cleanDateString);
    } else {
      return '_________________';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '_________________';
    }
    
    // Format as DD/MM/YYYY
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error, 'Input:', dateString);
    return '_________________';
  }
}

export async function generateBiodataWord(student: any) {
  try {
    // Debug: Log student data to check if keteranganLain exists
    console.log('Student data for biodata:', {
      namaLengkap: student.namaLengkap,
      keteranganLain: student.keteranganLain,
      keterangan: student.keterangan,
      jumlahSaudara: student.jumlahSaudara,
      asalSekolah: student.asalSekolah,
      foto: student.foto,
      fotoUrl: student.fotoUrl
    });
    // Create a temporary container for the biodata
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm'; // A4 width
    container.style.backgroundColor = 'white';
    container.style.padding = '15mm';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.fontSize = '11px';
    container.style.lineHeight = '1.5';
    
    // Create the biodata content
    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;">
        <div style="flex: 1;">
          <h1 style="font-size: 14px; font-weight: bold; margin: 0; text-align: center;">DATA DIRI PESERTA DIDIK</h1>
        </div>
        <div style="width: 100px; flex-shrink: 0; text-align: center; margin-left: 15px;">
          <div style="border: 1px solid #000; width: 80px; height: 100px; margin: 0 auto 5px; display: flex; align-items: center; justify-content: center; background-color: #f9f9f9; overflow: hidden;">
            ${student.foto || student.fotoUrl ? 
              `<img src="${student.foto || student.fotoUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Foto Siswa" />` : 
              '<span style="color: #666; font-size: 9px; text-align: center;">foto</span>'
            }
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 15px;">
        <div style="margin-bottom: 8px;">
          <p style="margin: 2px 0; font-size: 11px;"><strong>1. Nama Lengkap Siswa</strong> : ${student.namaLengkap || '_________________'}</p>
        </div>
        
        <div style="margin-bottom: 8px;">
          <p style="margin: 2px 0; font-size: 11px;"><strong>2. Tempat Lahir</strong> : ${student.tempatLahir || '_________________'}</p>
        </div>
        
        <div style="margin-bottom: 8px;">
          <p style="margin: 2px 0; font-size: 11px;"><strong>3. Tanggal Lahir</strong> : ${formatDate(student.tanggalLahir)}</p>
        </div>
        
        <div style="margin-bottom: 8px;">
          <p style="margin: 2px 0; font-size: 11px;"><strong>4. NISN</strong> : ${student.nisn || '_________________'}</p>
        </div>
        
        <div style="margin-bottom: 8px;">
          <p style="margin: 2px 0; font-size: 11px;"><strong>5. NIS</strong> : ${student.nis || '_________________'}</p>
        </div>
        
        <div style="margin-bottom: 8px;">
          <p style="margin: 2px 0; font-size: 11px;"><strong>6. Jenis Kelamin</strong> : ${student.jenisKelamin || '_________________'}</p>
        </div>
        
        <div style="margin-bottom: 8px;">
          <p style="margin: 2px 0; font-size: 11px;"><strong>7. Agama</strong> : ${student.agama || '_________________'}</p>
        </div>
        
        <div style="margin-bottom: 8px;">
          <p style="margin: 2px 0; font-size: 11px;"><strong>8. Jumlah Saudara</strong> : ${student.jumlahSaudara || '_________________'}</p>
        </div>
        
        <div style="margin-bottom: 8px;">
          <p style="margin: 2px 0; font-size: 11px;"><strong>9. Anak Ke</strong> : ${student.anakKe || '_________________'}</p>
        </div>
        
        <div style="margin-bottom: 8px;">
          <p style="margin: 2px 0; font-size: 11px;"><strong>10. Asal Sekolah</strong> : ${student.asalSekolah || '_________________'}</p>
        </div>
          
          <div style="margin-bottom: 8px;">
            <p style="margin: 2px 0; font-size: 11px;"><strong>11. Diterima di sekolah ini</strong></p>
            <p style="margin: 1px 0 1px 15px; font-size: 11px;">a. Dikelas : ${student.diterimaDiKelas || '_________________'}</p>
            <p style="margin: 1px 0 1px 15px; font-size: 11px;">b. Pada tanggal : ${formatDate(student.diterimaPadaTanggal)}</p>
          </div>
          
          <div style="margin-bottom: 8px;">
            <p style="margin: 2px 0; font-size: 11px;"><strong>12. Nama Orang Tua</strong></p>
            <p style="margin: 1px 0 1px 15px; font-size: 11px;">a. Ayah : ${student.namaAyah || '_________________'}</p>
            <p style="margin: 1px 0 1px 15px; font-size: 11px;">b. Ibu : ${student.namaIbu || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 8px;">
            <p style="margin: 2px 0; font-size: 11px;"><strong>13. Alamat Domisili</strong> : ${student.alamatDomisili || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 8px;">
            <p style="margin: 2px 0; font-size: 11px;"><strong>14. Alamat Orang tua</strong> : ${student.alamatOrtu || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 8px;">
            <p style="margin: 2px 0; font-size: 11px;"><strong>15. Nomor Telepon/WA orang tua</strong> : ${student.noTeleponOrtu || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 8px;">
            <p style="margin: 2px 0; font-size: 11px;"><strong>16. Pekerjaan Orang Tua</strong></p>
            <p style="margin: 1px 0 1px 15px; font-size: 11px;">a. Ayah : ${student.pekerjaanAyah === 'Lainnya' ? student.pekerjaanAyahLain : student.pekerjaanAyah || '_________________'}</p>
            <p style="margin: 1px 0 1px 15px; font-size: 11px;">b. Ibu : ${student.pekerjaanIbu === 'Lainnya' ? student.pekerjaanIbuLain : student.pekerjaanIbu || '_________________'}</p>
          </div>
          
          ${student.namaWali ? `
          <div style="margin-bottom: 8px;">
            <p style="margin: 2px 0; font-size: 11px;"><strong>17. Nama Wali</strong> : ${student.namaWali}</p>
          </div>
          
          <div style="margin-bottom: 8px;">
            <p style="margin: 2px 0; font-size: 11px;"><strong>18. Alamat Wali</strong> : ${student.alamatWali || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 8px;">
            <p style="margin: 2px 0; font-size: 11px;"><strong>19. Nomor Telepon/WA Wali</strong> : ${student.noTeleponWali || '_________________'}</p>
          </div>
          
          <div style="margin-bottom: 8px;">
            <p style="margin: 2px 0; font-size: 11px;"><strong>20. Pekerjaan Wali</strong> : ${student.pekerjaanWali === 'Lainnya' ? student.pekerjaanWaliLain : student.pekerjaanWali || '_________________'}</p>
          </div>
          ` : `
          <div style="margin-bottom: 8px;">
            <p style="margin: 2px 0; font-size: 11px;"><strong>17. Nama Wali</strong> : _________________</p>
          </div>
          
          <div style="margin-bottom: 8px;">
            <p style="margin: 2px 0; font-size: 11px;"><strong>18. Alamat Wali</strong> : _________________</p>
          </div>
          
          <div style="margin-bottom: 8px;">
            <p style="margin: 2px 0; font-size: 11px;"><strong>19. Nomor Telepon/WA Wali</strong> : _________________</p>
          </div>
          
          <div style="margin-bottom: 8px;">
            <p style="margin: 2px 0; font-size: 11px;"><strong>20. Pekerjaan Wali</strong> : _________________</p>
          </div>
          `}
          
          <div style="margin-bottom: 8px;">
            <p style="margin: 2px 0; font-size: 11px;"><strong>21. Keterangan Lainnya</strong> : ${student.keteranganLain || student.keterangan?.join(', ') || '_________________'}</p>
          </div>
        </div>
      
      <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
        <div style="text-align: right;">
          <p style="margin: 0; font-size: 11px;">Enrekang, 4 Oktober 2025</p>
          <p style="margin: 8px 0 3px 0; font-size: 11px;">An. Kepala Sekolah,</p>
          <p style="margin: 3px 0; font-size: 11px;">Wali Kelas</p>
          <div style="height: 30px; margin: 15px 0;"></div>
          <p style="margin: 0; font-size: 11px; text-decoration: underline;">Asrah Abu, S.Pd</p>
          <p style="margin: 3px 0 0 0; font-size: 11px;">NIP: _________________</p>
        </div>
      </div>
    `;
    
    // Add container to document
    document.body.appendChild(container);
    
    // Wait for images to load and ensure they are properly loaded
    const images = container.querySelectorAll('img');
    if (images.length > 0) {
      await Promise.all(Array.from(images).map(img => {
        return new Promise((resolve) => {
          if (img.complete) {
            resolve(true);
          } else {
            img.onload = () => resolve(true);
            img.onerror = () => resolve(true);
            // Timeout after 3 seconds
            setTimeout(() => resolve(true), 3000);
          }
        });
      }));
    }
    
    // Additional wait to ensure everything is rendered
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: true,
      imageTimeout: 5000,
      removeContainer: false
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