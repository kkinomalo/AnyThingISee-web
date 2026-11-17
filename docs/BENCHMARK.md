# 성능 비교 측정 방법

사이트 `/compare`에 올리는 수치는 **모두 아래 방법으로 직접 측정한 값**입니다. 측정 전에는 페이지가 "준비 중"으로 표시됩니다.

## 비교 대상
| id | 도구 | 비고 |
|---|---|---|
| `anythingisee` | AnyThingISee 0.1.0 Preview | Ghidra 11.4.3 **네이티브 디컴파일러 코어를 내장**. Ghidra와 결과가 비슷한 것은 이 때문이며 화면에 같이 밝힌다 |
| `ghidra` | Ghidra (최신 안정판) | Java(JDK 21) 필요 — 설치 크기에 별도 표기 |
| `ida-free` | IDA Free | |
| `binja-free` | Binary Ninja Free | |
| `cutter` | Cutter (rizin) | |

## 공개 전 확인
- [ ] IDA Free, Binary Ninja Free 사용권(EULA)이 벤치마크 결과 공개를 제한하지 않는지 확인하고 근거 링크를 남긴다. 제한이 있으면 해당 도구는 빼거나 허가를 받는다.
- [ ] 샘플은 **공개 · 재배포 가능한** 바이너리만 쓴다 (예: 공식 배포된 오픈소스 빌드). 비공개 · 악성 바이너리는 쓰지 않는다.

## 측정 환경 (고정)
- Windows 11 x64, 전원 모드 "최고 성능", 백신 실시간 검사는 샘플 · 프로젝트 폴더만 제외
- 측정 중 다른 프로그램 종료, 측정 전 재부팅 1회
- CPU · RAM · 디스크 · Windows 빌드 번호를 기록한다 (`pnpm bench:merge -- --env-os ... --env-cpu ... --env-ram ... --env-disk ...`)

## 샘플 세트
크기별(소 · 중 · 대) PE와 ELF를 1개 이상씩. `data/benchmarks.json`의 `samples`에 이름 · 형식 · 크기 · 바이트 수 · SHA-256 · 출처 URL을 적는다.

```powershell
Get-FileHash .\samples\zlib1.dll -Algorithm SHA256
```

## 측정 항목
| metric | 뜻 | 방법 |
|---|---|---|
| `install_size_mb` | 설치 폴더 크기 | `install-size.ps1` (별도 런타임은 비고로) |
| `cold_start_s` | 재부팅 후 첫 실행 → 첫 화면 | `measure.ps1 -Manual` |
| `auto_analysis_s` | 파일 열기 → 자동 분석 완료 | 헤드리스가 있으면 명령 실행, 없으면 `-Manual` |
| `decompile_s` | 같은 함수 1개 디컴파일 | `-Manual` (함수 주소를 기록) |
| `peak_memory_mb` | 분석 중 최대 메모리 | 명령 실행 시 자동 기록 |
| `functions_found` | 자동 분석 후 함수 수 | 화면 · 내보내기 값을 `results.jsonl`에 직접 입력 |

- 각 항목 **3회 이상** 반복하고 **중앙값**을 쓴다 (`merge.mts`가 계산).
- 같은 도구 · 샘플 · 항목을 다시 재면 이전 값이 바뀐다.

## 순서
```powershell
cd scripts\benchmark
.\install-size.ps1 -Tool ghidra -Path "C:\ghidra_11.4.3_PUBLIC"
.\measure.ps1 -Tool ghidra -Sample zlib-dll -Metric auto_analysis_s -FilePath "C:\ghidra_11.4.3_PUBLIC\support\analyzeHeadless.bat" -Arguments 'C:\bench\proj','bench','-import','C:\bench\samples\zlib1.dll','-overwrite','-deleteProject'
.\measure.ps1 -Tool anythingisee -Sample zlib-dll -Metric auto_analysis_s -Manual
```
```bash
pnpm bench:merge -- --env-os "Windows 11 24H2 (26100)" --env-cpu "..." --env-ram 32 --env-disk "NVMe SSD"
pnpm test   # 형식 검사
```
`data/benchmarks.json`을 커밋하면 `/compare`에 결과가 나타납니다.

## 한계
- GUI 수동 측정은 사람 반응 시간(±0.3초 안팎)이 섞입니다. 수동 측정 항목은 화면에 표시합니다.
- 도구마다 "분석 완료" 기준이 다릅니다. 각 도구의 진행 표시가 멈춘 시점을 기준으로 합니다.
- 결과는 측정 환경 · 버전에 따라 달라집니다. 모든 수치에 측정일 · 버전 · 환경을 함께 표시합니다.
