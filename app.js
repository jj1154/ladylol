let isAdmin = false;  // 기본적으로 관리자가 아닌 상태
const participantsList = document.getElementById("participants");
const fileUpload = document.getElementById("file-upload");
const loadParticipantsButton = document.getElementById("load-participants");
const adminPasswordInput = document.getElementById("admin-password");
const adminLoginButton = document.getElementById("admin-login");
const adminStatus = document.getElementById("admin-status");

// 관리자 로그인 로직 (간단한 비밀번호 검증)
adminLoginButton.addEventListener("click", () => {
    const password = adminPasswordInput.value;
    if (password === "1234") {  // 실제로는 더 안전한 방법으로 비밀번호를 처리해야 함
        isAdmin = true;
        adminStatus.textContent = "관리자: 로그인 상태";
        alert("관리자 권한이 활성화되었습니다.");
    } else {
        isAdmin = false;
        adminStatus.textContent = "관리자: 로그아웃 상태";
        alert("잘못된 비밀번호입니다.");
    }
});

// 참가자 목록을 엑셀 파일에서 불러오기
loadParticipantsButton.addEventListener("click", () => {
    const file = fileUpload.files[0];

    if (!file) {
        alert("엑셀 파일을 선택하세요.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const participants = XLSX.utils.sheet_to_json(sheet, { header: 1 });

            const groupedParticipants = {};

            // 참가자 목록을 티어별로 그룹화
            participants.forEach((row, index) => {
                if (index > 0 && row[0] && row[1]) {  // 첫 번째 열(티어)과 두 번째 열(이름)이 비어 있지 않은 경우
                    const tier = row[0];
                    const name = row[1];

                    if (!groupedParticipants[tier]) {
                        groupedParticipants[tier] = [];
                    }
                    groupedParticipants[tier].push(name);
                }
            });

            // 티어별로 참가자 목록 표시
            for (const [tier, names] of Object.entries(groupedParticipants)) {
                const tierHeader = document.createElement("li");
                tierHeader.textContent = `티어: ${tier}`;
                tierHeader.style.fontWeight = 'bold';
                participantsList.appendChild(tierHeader);

                names.forEach(name => {
                    const listItem = document.createElement("li");
                    listItem.textContent = name;

                    // 클릭 이벤트로 팔림 처리 (관리자만 가능)
                    listItem.addEventListener("click", () => {
                        if (isAdmin) {  // 관리자만 팔림 체크 가능
                            if (listItem.classList.contains("sold")) {
                                listItem.classList.remove("sold");
                                listItem.textContent = listItem.textContent.replace(" (팔림)", "");
                            } else {
                                listItem.classList.add("sold");
                                listItem.textContent += " (팔림)";
                            }
                        } else {
                            alert("팔림 처리는 관리자만 가능합니다.");
                        }
                    });

                    participantsList.appendChild(listItem);
                });
            }
        } catch (error) {
            alert("파일을 읽는 중 오류가 발생했습니다. 올바른 엑셀 파일인지 확인하세요.");
            console.error(error);
        }
    };

    reader.readAsArrayBuffer(file);
});
