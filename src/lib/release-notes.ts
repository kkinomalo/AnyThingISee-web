// 릴리스 노트 번역본 (#57). GitHub 원문은 한국어라서, 영어 · 일본어 페이지는 여기 번역을 보여 준다.
// 새 릴리스를 내면 같은 형식으로 추가한다. 번역이 없는 tag · 언어는 GitHub 원문을 그대로 쓴다.

const WEBVIEW2 = "https://developer.microsoft.com/en-us/microsoft-edge/webview2/";
const README = "https://github.com/kkinomalo/AnyThingISee-releases#readme";

export const translatedNotes: Record<string, Partial<Record<string, string>>> = {
  "v0.1.0": {
    en: `## Install and use

1. Download the setup.exe from Assets and run it.
2. Choose the installer language and accept the Free Edition agreement.
3. Launch AnyThingISee from the Start menu and open a file.

Requires Windows 10/11 x64, .NET Framework 4.6.2 or later and the Microsoft Edge WebView2 Runtime. You don't need to install Ghidra or Java. If WebView2 is missing, install the Evergreen Runtime x64 from the [official Microsoft site](${WEBVIEW2}).

## What's included

- Built-in C decompiler with assembly, graph and data views
- Function and data navigation, project notes, instruction patching with export to a separate file
- Korean, English and Japanese interface and the product license agreement
- Third-party component licenses and notices

The Free Edition is currently free for both individuals and organizations; the proprietary source is not published. A paid edition may be offered later under a separate agreement, but the current free version will never be made paid retroactively.

## Preview status

The installer build and package integrity checks are complete. Full runtime validation of install/uninstall and of the latest decompiler changes has not been completed. Check important conditions, types and return values in the C output against the original assembly. The installer is currently not code-signed.

See the [README](${README}) for detailed usage. The automatically generated Source code archives contain only the documents and license terms of this distribution repository.`,
    ja: `## インストールと使い方

1. Assets から setup.exe をダウンロードして実行します。
2. インストール言語を選び、Free Edition の利用規約に同意します。
3. スタートメニューから AnyThingISee を起動し、ファイルを開きます。

Windows 10/11 x64、.NET Framework 4.6.2 以降、Microsoft Edge WebView2 Runtime が必要です。Ghidra と Java を別途インストールする必要はありません。WebView2 がない場合は [Microsoft 公式サイト](${WEBVIEW2})から Evergreen Runtime x64 をインストールしてください。

## 収録内容

- 内蔵 C 逆コンパイラーと、アセンブリ・グラフ・データ表示
- 関数・データの探索、プロジェクトメモ、命令パッチと別ファイルへの書き出し
- 日本語・英語・韓国語のインターフェースと製品利用規約
- 外部コンポーネントのライセンスと告知

Free Edition は現在、個人・法人ともに無料で利用できます。独自開発のソースコードは非公開です。将来、有料エディションを別契約で提供する場合がありますが、現在の無料版をさかのぼって有料にすることはありません。

## Preview の状態

インストーラーのビルドとパッケージの整合性確認は完了しています。このインストーラーのインストール・アンインストール動作と、最新の逆コンパイル変更に対する完全な実行検証は完了していません。C の結果の重要な条件・型・戻り値は、元のアセンブリと照合してください。現在のインストーラーにはコード署名がありません。

詳しい使い方は [README](${README}) を参照してください。自動生成される Source code のアーカイブには、この配布リポジトリの文書と規約のみが含まれます。`,
  },
};

/** 언어에 맞는 본문. 번역이 있으면 번역, 없으면 null (호출부에서 원문 사용) */
export function translatedNote(tag: string, locale: string): string | null {
  return translatedNotes[tag]?.[locale] ?? null;
}
