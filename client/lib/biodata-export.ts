import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import { Student } from './data';

export async function generateBiodataWord(student: Student): Promise<void> {
  try {
    // Convert foto URL to base64 if available
    let fotoBase64: string | undefined;
    if (student.fotoUrl) {
      try {
        const response = await fetch(student.fotoUrl);
        const blob = await response.blob();
        fotoBase64 = await blobToBase64(blob);
      } catch (error) {
        console.warn('Gagal memuat foto:', error);
      }
    }

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: "KETERANGAN TENTANG DIRI PESERTA DIDIK",
                bold: true,
                color: "FF0000",
                size: 32,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          // Main content table
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              // Row 1: Nama Peserta Didik
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: "1. Nama Peserta Didik (Lengkap)",
                          bold: true,
                        }),
                      ],
                    })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: student.namaLengkap || "_________________",
                        }),
                      ],
                    })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),

              // Row 2: Nomor Induk
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: "2. Nomor Induk",
                          bold: true,
                        }),
                      ],
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: student.nis || "_________________",
                        }),
                      ],
                    })],
                  }),
                ],
              }),

              // Row 3: Tempat, Tanggal Lahir
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: "3. Tempat, Tanggal Lahir",
                          bold: true,
                        }),
                      ],
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: `${student.tempatLahir || "_________________"}, ${formatDate(student.tanggalLahir) || "_________________"}`,
                        }),
                      ],
                    })],
                  }),
                ],
              }),

              // Row 4: Jenis Kelamin
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: "4. Jenis Kelamin",
                          bold: true,
                        }),
                      ],
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: student.jenisKelamin || "_________________",
                        }),
                      ],
                    })],
                  }),
                ],
              }),

              // Row 5: Agama
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: "5. Agama",
                          bold: true,
                        }),
                      ],
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: student.agama || "_________________",
                        }),
                      ],
                    })],
                  }),
                ],
              }),

              // Row 6: Status dalam Keluarga
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: "6. Status dalam Keluarga",
                          bold: true,
                        }),
                      ],
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: `Anak ke-${student.anakKe || "____"} dari ${student.jumlahSaudara + 1 || "____"} bersaudara`,
                        }),
                      ],
                    })],
                  }),
                ],
              }),

              // Row 7: Alamat Peserta Didik
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: "8. Alamat Peserta Didik",
                          bold: true,
                        }),
                      ],
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: student.alamatDomisili || "_________________",
                        }),
                      ],
                    })],
                  }),
                ],
              }),

              // Row 8: Nomor Telepon Rumah
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: "9. Nomor Telepon Rumah",
                          bold: true,
                        }),
                      ],
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: student.noTeleponSiswa || "_________________",
                        }),
                      ],
                    })],
                  }),
                ],
              }),

              // Row 9: Sekolah Asal
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: "10. Sekolah Asal",
                          bold: true,
                        }),
                      ],
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: student.asalSekolah || "_________________",
                        }),
                      ],
                    })],
                  }),
                ],
              }),

              // Row 10: Diterima di sekolah ini
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: "11. Diterima di sekolah ini",
                          bold: true,
                        }),
                      ],
                    })],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "a. Dikelas: ",
                            bold: true,
                          }),
                          new TextRun({
                            text: student.diterimaDiKelas || "_________________",
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "b. Pada tanggal: ",
                            bold: true,
                          }),
                          new TextRun({
                            text: formatDate(student.diterimaPadaTanggal) || "_________________",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              // Row 11: Nama Orang Tua
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: "12. Nama Orang Tua",
                          bold: true,
                        }),
                      ],
                    })],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "a. Ayah: ",
                            bold: true,
                          }),
                          new TextRun({
                            text: student.namaAyah || "_________________",
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "b. Ibu: ",
                            bold: true,
                          }),
                          new TextRun({
                            text: student.namaIbu || "_________________",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              // Row 12: Alamat Orang Tua
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: "13. Alamat Orang Tua",
                          bold: true,
                        }),
                      ],
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: student.alamatOrtu || "_________________",
                        }),
                      ],
                    })],
                  }),
                ],
              }),

              // Row 13: Nomor Telepon Rumah Orang Tua
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: "14. Nomor Telepon Rumah",
                          bold: true,
                        }),
                      ],
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: student.noTeleponOrtu || "_________________",
                        }),
                      ],
                    })],
                  }),
                ],
              }),

              // Row 14: Pekerjaan Orang Tua
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: "15. Pekerjaan Orang Tua",
                          bold: true,
                        }),
                      ],
                    })],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "a. Ayah: ",
                            bold: true,
                          }),
                          new TextRun({
                            text: student.pekerjaanAyah || "_________________",
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: "b. Ibu: ",
                            bold: true,
                          }),
                          new TextRun({
                            text: student.pekerjaanIbu || "_________________",
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),

              // Row 15: Nama Wali (if exists)
              ...(student.namaWali ? [new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: "16. Nama Wali Peserta Didik",
                          bold: true,
                        }),
                      ],
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: student.namaWali,
                        }),
                      ],
                    })],
                  }),
                ],
              })] : []),

              // Row 16: Alamat Wali (if exists)
              ...(student.alamatWali ? [new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: "17. Alamat Wali Peserta Didik",
                          bold: true,
                        }),
                      ],
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: student.alamatWali,
                        }),
                      ],
                    })],
                  }),
                ],
              })] : []),

              // Row 17: Nomor Telepon Wali (if exists)
              ...(student.noTeleponWali ? [new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: "18. Nomor Telepon Rumah",
                          bold: true,
                        }),
                      ],
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: student.noTeleponWali,
                        }),
                      ],
                    })],
                  }),
                ],
              })] : []),

              // Row 18: Pekerjaan Wali (if exists)
              ...(student.pekerjaanWali ? [new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: "19. Pekerjaan Wali Peserta Didik",
                          bold: true,
                        }),
                      ],
                    })],
                  }),
                  new TableCell({
                    children: [new Paragraph({
                      children: [
                        new TextRun({
                          text: student.pekerjaanWali,
                        }),
                      ],
                    })],
                  }),
                ],
              })] : []),
            ],
          }),

          // Photo section
          new Paragraph({
            children: [
              new TextRun({
                text: "Pas Foto",
                bold: true,
                size: 24,
              }),
            ],
            spacing: { before: 400, after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "3 x 4",
                size: 20,
              }),
            ],
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Berwarna",
                color: "FF0000",
                size: 20,
              }),
            ],
            spacing: { after: 400 },
          }),

          // Signature section
          new Paragraph({
            children: [
              new TextRun({
                text: "Enrekang, " + new Date().getFullYear(),
                size: 20,
              }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "An. Kepala Sekolah,",
                size: 20,
              }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "Wali Kelas",
                size: 20,
              }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200, after: 400 },
          }),

          new Paragraph({
            children: [
              new TextRun({
                text: "_________________",
                size: 20,
              }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { before: 200 },
          }),
        ],
      }],
    });

    // Generate and download
    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    saveAs(blob, `Biodata_${student.namaLengkap.replace(/\s+/g, '_')}.docx`);

  } catch (error) {
    console.error('Error generating biodata:', error);
    throw new Error('Gagal membuat dokumen biodata');
  }
}

function formatDate(dateString: string): string {
  if (!dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }
  return '';
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]); // Remove data:image/...;base64, prefix
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
