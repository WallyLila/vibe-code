// รอให้หน้าเว็บดาวน์โหลดโครงสร้าง HTML โหลดเสร็จสมบูรณ์ทั้งหมดก่อนรันโค้ด
document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================================================
    // ระบบเปิด-ปิดหน้าต่างข้อมูล (MODAL INTERACTION SYSTEM)
    // ==========================================================================
    
    // ดึงปุ่มกดทั้งหมดที่มีแอตทริบิวต์ data-modal-target (ปุ่มที่ใช้คลิกเพื่อเปิดหน้าต่าง)
    const modalButtons = document.querySelectorAll('[data-modal-target]');
    
    // ดึงปุ่มปิด (ปุ่มกากบาท X) ทั้งหมดในทุกหน้าต่าง
    const closeButtons = document.querySelectorAll('.close-modal-btn');
    
    // ดึงพื้นหลังโปร่งแสง (Backdrop) ของหน้าต่างทั้งหมด
    const overlays = document.querySelectorAll('.modal-overlay');

    /**
     * ฟังก์ชันสำหรับ "เปิด" หน้าต่าง Modal
     * @param {string} modalId - ไอดีของหน้าต่างที่ต้องการเปิด (เช่น 'about-modal')
     */
    function openModal(modalId) {
        // ค้นหาหน้าต่างตามไอดีที่ส่งเข้ามา
        const modal = document.getElementById(modalId);
        if (!modal) return; // ถ้าไม่พบหน้าต่าง ให้ยกเลิกการทำงาน
        
        // ใส่คลาส 'active' เพื่อให้ CSS แสดงผลและเล่นอนิเมชันเปิดหน้าต่าง
        modal.classList.add('active');
        
        // ปิดการเลื่อนหน้าเว็บพื้นหลัง (ป้องกันการเลื่อนขึ้น-ลงขณะเปิดหน้าต่าง)
        document.body.style.overflow = 'hidden';

        // ถ้าเป็นหน้าต่างทักษะความสามารถ ให้เริ่มเล่นอนิเมชันแถบพลัง
        if (modalId === 'skills-modal') {
            animateSkillBars(modal);
        }
    }

    /**
     * ฟังก์ชันสำหรับ "ปิด" หน้าต่าง Modal
     * @param {HTMLElement} modal - ออบเจกต์หน้าต่างที่ต้องการปิด
     */
    function closeModal(modal) {
        if (!modal) return;
        
        // เอาคลาส 'active' ออกเพื่อย่อขนาดและเฟดหน้าต่างหายไป
        modal.classList.remove('active');
        
        // ตรวจสอบว่ายังมีหน้าต่างอื่นเปิดอยู่อีกไหม
        const activeModals = document.querySelectorAll('.modal-overlay.active');
        // ถ้าไม่มีหน้าต่างเปิดอยู่เลย ให้คืนค่าให้หน้าจอหลักกลับมาเลื่อนขึ้น-ลงได้ตามปกติ
        if (activeModals.length === 0) {
            document.body.style.overflow = '';
        }

        // ถ้าหน้าต่างที่ปิดคือหน้าทักษะ ให้รีเซ็ตแถบพลังเป็น 0% เพื่อพร้อมเล่นอนิเมชันใหม่รอบหน้า
        if (modal.id === 'skills-modal') {
            resetSkillBars(modal);
        }
    }

    // ตั้งค่าตัวตรวจจับการคลิก (Event Listener) ให้กับทุกปุ่มเปิดหน้าต่างบน Dashboard
    modalButtons.forEach(button => {
        button.addEventListener('click', () => {
            // ดึงค่าไอดีเป้าหมายจากปุ่ม เช่น 'about-modal'
            const targetId = button.getAttribute('data-modal-target');
            openModal(targetId); // เรียกฟังก์ชันเปิดหน้าต่าง
        });
    });

    // ตั้งค่าตัวตรวจจับการคลิกให้กับทุกปุ่มปิด (ปุ่มกากบาท X)
    closeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // หาหน้าต่างที่ครอบปุ่มกากบาทนี้อยู่ แล้วสั่งปิด
            const modal = e.target.closest('.modal-overlay');
            closeModal(modal);
        });
    });

    // ตั้งค่าให้คลิกที่พื้นที่ว่างด้านนอกหน้าต่าง (พื้นหลังเบลอ) แล้วปิดหน้าต่างได้เลย
    overlays.forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            // ตรวจว่าคลิกโดนพื้นที่เบลอจริงๆ ไม่ได้คลิกด้านในกล่องข้อความ
            if (e.target === overlay) {
                closeModal(overlay);
            }
        });
    });

    // ตั้งค่าให้กดปุ่ม 'Escape' บนคีย์บอร์ดเพื่อปิดหน้าต่างล่าสุดที่เปิดอยู่
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // ค้นหาหน้าต่างที่กำลังเปิดอยู่ (มีคลาส active)
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                closeModal(activeModal); // สั่งปิดหน้าต่างนั้น
            }
        }
    });

    // ==========================================================================
    // ระบบอนิเมชันแถบความชำนาญ (SKILLS PROGRESS BAR ANIMATION)
    // ==========================================================================
    
    /**
     * ฟังก์ชันเล่นอนิเมชันเลื่อนแถบพลังความชำนาญ
     * @param {HTMLElement} modal - หน้าต่างทักษะความสามารถ
     */
    function animateSkillBars(modal) {
        // ค้นหาแถบแสดงระดับความชำนาญทั้งหมดในหน้านั้น
        const fills = modal.querySelectorAll('.skill-bar-fill');
        
        // หน่วงเวลาเล็กน้อย (150 มิลลิวินาที) เพื่อให้หน้าต่างเด้งเสร็จก่อน แล้วค่อยเริ่มขยับแถบพลัง
        setTimeout(() => {
            fills.forEach(fill => {
                // ดึงค่าเปอร์เซ็นต์ที่เขียนไว้ในแอตทริบิวต์สไตล์ของ HTML เช่น '--percent: 90%'
                const percent = fill.style.getPropertyValue('--percent');
                // กำหนดความกว้างจริงตามค่าเปอร์เซ็นต์ เพื่อให้แถบค่อยๆ ขยายตัว
                fill.style.width = percent;
            });
        }, 150);
    }

    /**
     * ฟังก์ชันรีเซ็ตแถบความกว้างพลังงานให้เหลือ 0%
     */
    function resetSkillBars(modal) {
        const fills = modal.querySelectorAll('.skill-bar-fill');
        fills.forEach(fill => {
            // สั่งให้ความกว้างกลับเป็น 0 เพื่อเริ่มเล่นอนิเมชันใหม่เมื่อเปิดอีกครั้ง
            fill.style.width = '0';
        });
    }

    // ==========================================================================
    // ระบบกรองและจัดหมวดหมู่ผลงาน (PORTFOLIO FILTER SYSTEM)
    // ==========================================================================
    
    // ดึงปุ่มตัวกรองผลงานทั้งหมด (เช่น ทั้งหมด, Network Design, Security)
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    // ดึงกล่องการ์ดผลงานโครงการทั้งหมด
    const projectCards = document.querySelectorAll('.project-card');

    // ตั้งค่าตรวจจับการคลิกปุ่มกรองแต่ละปุ่ม
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // 1. ลบคลาส 'active' (ไฮไลต์สีน้ำเงิน) ออกจากทุกปุ่มกรอง
            filterButtons.forEach(b => b.classList.remove('active'));
            // 2. ใส่คลาส 'active' ให้กับปุ่มที่เรากดคลิกล่าสุด
            btn.classList.add('active');

            // ดึงชื่อหมวดหมู่ที่ใช้กรอง เช่น 'all', 'net-design', 'security'
            const filterValue = btn.getAttribute('data-filter');

            // 3. วนลูปตรวจสอบการ์ดผลงานแต่ละโครงการ
            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                // ถ้าเลือกดู "ทั้งหมด" หรือประเภทโครงการตรงกับหมวดหมู่ที่คลิก
                if (filterValue === 'all' || category === filterValue) {
                    // แสดงการ์ดโครงการขึ้นมา
                    card.style.display = 'flex';
                    // หน่วงเวลาเล็กน้อยเพื่อให้เบราว์เซอร์ปรับสไตล์เสร็จ แล้วค่อยเฟดภาพขึ้นมาอย่างนุ่มนวล
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    // หากไม่ตรงกับหมวดหมู่ที่กรอง ให้ทำการเฟดและย่อขนาด
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    // รออนิเมชันย่อขนาดยุบตัวเสร็จ (300 มิลลิวินาที) แล้วสั่งซ่อนการ์ดนั้นไปถาวร
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
});
