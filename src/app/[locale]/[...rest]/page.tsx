import { notFound } from "next/navigation";

// 없는 주소도 언어 레이아웃(헤더·푸터) 안에서 404를 보여주기 위한 경로
export default function CatchAllPage() {
  notFound();
}
