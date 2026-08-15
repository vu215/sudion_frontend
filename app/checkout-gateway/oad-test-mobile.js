const autocannon = require("autocannon");
const fs = require("fs");

// ======================================================
// 1. CẤU HÌNH WEBSITE CẦN TEST
// ======================================================

// Có thể truyền URL khi chạy bằng terminal.
// Nếu không truyền thì mặc định test URL bên dưới.
//
// Ví dụ:
// node load-test-mobile.js https://staging.upnext.works/vi
const targetUrl =
  process.argv[2] || "https://staging.upnext.works/vi";

let parsedUrl;

try {
  parsedUrl = new URL(targetUrl);
} catch {
  console.error("URL không hợp lệ.");
  process.exit(1);
}

// Chỉ cho phép chạy đúng website staging đã được giao.
// Việc này giúp tránh vô tình load test website khác.
if (
  parsedUrl.protocol !== "https:" ||
  parsedUrl.hostname !== "staging.upnext.works"
) {
  console.error(
    "Script chỉ được phép chạy với https://staging.upnext.works"
  );
  process.exit(1);
}

// ======================================================
// 2. CẤU HÌNH MỨC TẢI
// ======================================================

// Giả lập số lượng thiết bị mobile truy cập đồng thời.
//
// Script sẽ test lần lượt:
// 50 → 100 → 150 → ... → 1000 kết nối.
//
// Nếu server quá tải nặng, script sẽ tự dừng,
// không tiếp tục chạy các mức phía sau.
const levels = [
  100,
  200,
  250,
  300,
  400,
  500,
  600,
  700,
  1000,
];

// Mỗi mức kết nối chạy trong 15 giây.
const DURATION_SECONDS = 15;

// Nghỉ 15 giây giữa mỗi mức để server hồi phục.
//
// 15000 mili giây = 15 giây.
const COOLDOWN_MS = 1000;

// ======================================================
// 3. CẤU HÌNH NGƯỠNG ĐÁNH GIÁ
// ======================================================

// Nếu tổng tỷ lệ lỗi từ 20% trở lên,
// script đánh giá server quá tải nặng và tự dừng.
const HARD_ERROR_RATE = 20;

// Nếu tỷ lệ timeout từ 10% trở lên,
// script đánh giá server quá tải nặng và tự dừng.
const HARD_TIMEOUT_RATE = 10;

// Nếu tỷ lệ lỗi từ 5% trở lên,
// server được xem là bắt đầu mất ổn định.
const UNSTABLE_ERROR_RATE = 5;

// Nếu tỷ lệ timeout từ 2% trở lên,
// server được xem là bắt đầu mất ổn định.
const UNSTABLE_TIMEOUT_RATE = 2;

// Nếu P99 từ 5 giây trở lên,
// phần lớn người dùng vẫn vào được nhưng một số người
// có thể phải chờ rất lâu.
const UNSTABLE_P99_MS = 5000;

// Mỗi request được phép chờ tối đa 20 giây.
//
// Đây không phải thời gian chạy toàn bài test.
// Đây là timeout riêng của từng request.
const REQUEST_TIMEOUT_SECONDS = 20;

// Nơi chứa kết quả của từng mức test.
const reports = [];

// ======================================================
// 4. HÀM TẠM DỪNG
// ======================================================

function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

// ======================================================
// 5. CHẠY MỘT MỨC LOAD TEST
// ======================================================

function runLoadTest(connections) {
  return new Promise((resolve, reject) => {
    console.log("\n========================================");
    console.log(
      `Đang giả lập ${connections} thiết bị mobile truy cập đồng thời`
    );
    console.log(
      `Thời gian test: ${DURATION_SECONDS} giây`
    );
    console.log(`URL: ${targetUrl}`);
    console.log("========================================");

    // Khởi tạo Autocannon.
    const instance = autocannon(
      {
        // URL cần kiểm tra.
        url: targetUrl,

        // Số kết nối đồng thời.
        connections,

        // Thời gian chạy của một mức.
        duration: DURATION_SECONDS,

        // Mỗi kết nối gửi từng request một.
        //
        // pipelining = 1 gần với hành vi truy cập
        // bình thường hơn so với gửi nhiều request
        // liên tục trên cùng một kết nối.
        pipelining: 1,

        // Timeout của từng request.
        timeout: REQUEST_TIMEOUT_SECONDS,

        // Chỉ gửi GET nên không tạo hoặc sửa dữ liệu.
        method: "GET",

        // Giả lập User-Agent của trình duyệt Chrome
        // trên điện thoại Android.
        headers: {
          "user-agent":
            "Mozilla/5.0 (Linux; Android 14; SM-S928B) " +
            "AppleWebKit/537.36 (KHTML, like Gecko) " +
            "Chrome/150.0.0.0 Mobile Safari/537.36",

          accept:
            "text/html,application/xhtml+xml," +
            "application/xml;q=0.9,image/avif," +
            "image/webp,*/*;q=0.8",

          "accept-language": "vi-VN,vi;q=0.9,en;q=0.8",

          // Không dùng cache để mỗi request đều thực sự
          // đi đến CDN hoặc server.
          "cache-control": "no-cache",
          pragma: "no-cache",

          // Đánh dấu đây là bài load test được cho phép.
          "x-load-test-source":
            "authorized-mobile-staging-test",
        },
      },

      // Callback được gọi sau khi hoàn thành mức test.
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      }
    );

    // Hiển thị thanh tiến trình trong terminal.
    autocannon.track(instance, {
      renderProgressBar: true,
      renderResultsTable: false,
      renderLatencyTable: false,
    });
  });
}

// ======================================================
// 6. PHÂN TÍCH KẾT QUẢ
// ======================================================

function analyzeResult(result, connections) {
  // Số request đã hoàn thành.
  const completedRequests = Number(
    result.requests?.total || 0
  );

  // Số request đã gửi.
  //
  // Một số phiên bản Autocannon có thuộc tính sent,
  // một số phiên bản có thể không có.
  const sentRequests = Number(
    result.requests?.sent ||
      completedRequests + Number(result.errors || 0)
  );

  // Request trung bình mỗi giây.
  const requestsPerSecond = Number(
    result.requests?.average || 0
  );

  // Errors là lỗi kết nối, socket, request...
  //
  // Trong Autocannon, timeout thường được tính
  // trong nhóm errors, vì vậy không cộng timeout
  // thêm lần nữa vào failedRequests.
  const errors = Number(result.errors || 0);

  // Request bị timeout.
  const timeouts = Number(result.timeouts || 0);

  // Response không thuộc nhóm HTTP 2xx.
  //
  // Ví dụ:
  // 403, 404, 429, 500, 502, 503, 504...
  const non2xx = Number(result.non2xx || 0);

  // Tổng request thất bại.
  //
  // Không cộng timeouts vì timeout thường đã nằm
  // trong errors của Autocannon.
  const failedRequests = Math.min(
    sentRequests,
    errors + non2xx
  );

  // Tỷ lệ lỗi trên tổng số request đã gửi.
  const errorRate =
    sentRequests > 0
      ? (failedRequests / sentRequests) * 100
      : 100;

  // Tỷ lệ request bị timeout.
  const timeoutRate =
    sentRequests > 0
      ? (timeouts / sentRequests) * 100
      : 100;

  // Độ trễ trung bình.
  const averageLatency = Number(
    result.latency?.average || 0
  );

  // Autocannon thường không có đúng P95.
  //
  // P97.5 nghĩa là 97,5% request có độ trễ
  // thấp hơn hoặc bằng giá trị này.
  const p97_5Latency = Number(
    result.latency?.p97_5 ||
      result.latency?.p99 ||
      0
  );

  // P99 nghĩa là 99% request có độ trễ
  // thấp hơn hoặc bằng giá trị này.
  const p99Latency = Number(
    result.latency?.p99 || 0
  );

  // Thống kê các mã HTTP nếu Autocannon hỗ trợ.
  const statusCodeStats =
    result.statusCodeStats || {};

  let status = "Ổn định";

  // Xác định server quá tải nặng.
  if (
    errorRate >= HARD_ERROR_RATE ||
    timeoutRate >= HARD_TIMEOUT_RATE ||
    requestsPerSecond <= 0
  ) {
    status = "Quá tải nặng";
  }

  // Xác định server bắt đầu mất ổn định.
  else if (
    errorRate >= UNSTABLE_ERROR_RATE ||
    timeoutRate >= UNSTABLE_TIMEOUT_RATE ||
    p99Latency >= UNSTABLE_P99_MS
  ) {
    status = "Mất ổn định";
  }

  return {
    connections,

    requestsPerSecond: Number(
      requestsPerSecond.toFixed(2)
    ),

    averageLatency: Number(
      averageLatency.toFixed(2)
    ),

    p97_5Latency,
    p99Latency,

    sentRequests,
    completedRequests,

    errors,
    timeouts,
    non2xx,
    failedRequests,

    errorRate: Number(errorRate.toFixed(2)),
    timeoutRate: Number(timeoutRate.toFixed(2)),

    statusCodeStats,
    status,
  };
}

// ======================================================
// 7. HIỂN THỊ BẢNG KẾT QUẢ
// ======================================================

function printReports() {
  console.log("\nKẾT QUẢ HIỆN TẠI:");

  console.table(
    reports.map((item) => ({
      "Kết nối": item.connections,

      "Request/giây": item.requestsPerSecond,

      "Độ trễ TB":
        `${item.averageLatency} ms`,

      "P97.5":
        `${item.p97_5Latency} ms`,

      P99:
        `${item.p99Latency} ms`,

      "Request đã gửi":
        item.sentRequests,

      "Request hoàn thành":
        item.completedRequests,

      Errors:
        item.errors,

      Timeouts:
        item.timeouts,

      "Non-2xx":
        item.non2xx,

      "Tổng lỗi":
        item.failedRequests,

      "Tỷ lệ lỗi":
        `${item.errorRate}%`,

      "Tỷ lệ timeout":
        `${item.timeoutRate}%`,

      "Kết quả":
        item.status,
    }))
  );

  // Hiển thị mã HTTP của mức vừa test.
  const latestReport =
    reports[reports.length - 1];

  if (latestReport) {
    console.log(
      "\nThống kê mã HTTP của mức vừa test:"
    );

    if (
      Object.keys(
        latestReport.statusCodeStats
      ).length > 0
    ) {
      console.table(
        latestReport.statusCodeStats
      );
    } else {
      console.log(
        "Phiên bản Autocannon hiện tại không trả statusCodeStats."
      );
    }
  }
}

// ======================================================
// 8. HÀM XỬ LÝ DỮ LIỆU CSV
// ======================================================

function escapeCsvValue(value) {
  const stringValue =
    typeof value === "object"
      ? JSON.stringify(value)
      : String(value ?? "");

  return `"${stringValue.replace(/"/g, '""')}"`;
}

// ======================================================
// 9. LƯU BÁO CÁO JSON VÀ CSV
// ======================================================

function saveReport() {
  const timestamp = Date.now();

  const jsonFilename =
    `mobile-load-test-${timestamp}.json`;

  const csvFilename =
    `mobile-load-test-${timestamp}.csv`;

  const reportData = {
    url: targetUrl,

    testedAt: new Date().toISOString(),

    description:
      "Authorized mobile user-agent load test on staging",

    durationPerLevelSeconds:
      DURATION_SECONDS,

    cooldownMilliseconds:
      COOLDOWN_MS,

    requestTimeoutSeconds:
      REQUEST_TIMEOUT_SECONDS,

    levels,

    thresholds: {
      hardErrorRate:
        HARD_ERROR_RATE,

      hardTimeoutRate:
        HARD_TIMEOUT_RATE,

      unstableErrorRate:
        UNSTABLE_ERROR_RATE,

      unstableTimeoutRate:
        UNSTABLE_TIMEOUT_RATE,

      unstableP99Milliseconds:
        UNSTABLE_P99_MS,
    },

    results: reports,
  };

  // Lưu file JSON.
  fs.writeFileSync(
    jsonFilename,
    JSON.stringify(reportData, null, 2),
    "utf8"
  );

  // Tiêu đề các cột CSV.
  const csvHeader = [
    "connections",
    "requestsPerSecond",
    "averageLatency",
    "p97_5Latency",
    "p99Latency",
    "sentRequests",
    "completedRequests",
    "errors",
    "timeouts",
    "non2xx",
    "failedRequests",
    "errorRate",
    "timeoutRate",
    "statusCodeStats",
    "status",
  ].join(",");

  // Dữ liệu từng dòng CSV.
  const csvRows = reports.map((item) => {
    return [
      item.connections,
      item.requestsPerSecond,
      item.averageLatency,
      item.p97_5Latency,
      item.p99Latency,
      item.sentRequests,
      item.completedRequests,
      item.errors,
      item.timeouts,
      item.non2xx,
      item.failedRequests,
      item.errorRate,
      item.timeoutRate,
      escapeCsvValue(
        item.statusCodeStats
      ),
      escapeCsvValue(item.status),
    ].join(",");
  });

  fs.writeFileSync(
    csvFilename,
    [csvHeader, ...csvRows].join("\n"),
    "utf8"
  );

  console.log("\n========================================");
  console.log(`Đã lưu JSON: ${jsonFilename}`);
  console.log(`Đã lưu CSV: ${csvFilename}`);
  console.log("========================================");
}

// ======================================================
// 10. CHƯƠNG TRÌNH CHÍNH
// ======================================================

async function main() {
  let highestTestedLevel = 0;
  let highestStableLevel = 0;
  let firstUnstableLevel = null;
  let heavyOverloadLevel = null;

  console.log("========================================");
  console.log("BẮT ĐẦU MOBILE LOAD TEST");
  console.log(`URL: ${targetUrl}`);
  console.log(
    `Các mức: ${levels.join(" → ")}`
  );
  console.log(
    `Mỗi mức chạy: ${DURATION_SECONDS} giây`
  );
  console.log(
    `Nghỉ giữa các mức: ${COOLDOWN_MS / 1000} giây`
  );
  console.log("========================================");

  // Chạy lần lượt từng mức kết nối.
  for (const connections of levels) {
    try {
      const rawResult =
        await runLoadTest(connections);

      const report = analyzeResult(
        rawResult,
        connections
      );

      reports.push(report);

      highestTestedLevel = connections;

      // Chỉ cập nhật mức ổn định cao nhất
      // khi kết quả là "Ổn định".
      if (report.status === "Ổn định") {
        highestStableLevel = connections;
      }

      printReports();

      // Ghi nhận mức đầu tiên bắt đầu mất ổn định.
      if (
        report.status === "Mất ổn định" &&
        firstUnstableLevel === null
      ) {
        firstUnstableLevel = connections;
      }

      // Nếu quá tải nặng thì tự dừng.
      if (report.status === "Quá tải nặng") {
        heavyOverloadLevel = connections;

        console.log(
          "\n========== ĐẠT NGƯỠNG QUÁ TẢI =========="
        );

        console.log(
          `Mức kết nối: ${connections}`
        );

        console.log(
          `Request/giây: ${report.requestsPerSecond}`
        );

        console.log(
          `Tỷ lệ lỗi: ${report.errorRate}%`
        );

        console.log(
          `Tỷ lệ timeout: ${report.timeoutRate}%`
        );

        console.log(
          `Độ trễ trung bình: ${report.averageLatency} ms`
        );

        console.log(
          `P99: ${report.p99Latency} ms`
        );

        console.log(
          "Script tự dừng để không giữ server quá tải lâu."
        );

        console.log(
          "========================================"
        );

        break;
      }

      // Không cần nghỉ sau mức cuối cùng.
      const isLastLevel =
        connections === levels[levels.length - 1];

      if (!isLastLevel) {
        console.log(
          `\nNghỉ ${COOLDOWN_MS / 1000} giây để server hồi phục...`
        );

        await sleep(COOLDOWN_MS);
      }
    } catch (error) {
      heavyOverloadLevel = connections;

      console.error(
        "\nKhông thể hoàn thành mức test."
      );

      console.error(
        `Mức kết nối: ${connections}`
      );

      console.error(
        `Lỗi: ${error.message}`
      );

      console.error(
        "Server, proxy hoặc CDN có thể đã ngắt kết nối."
      );

      break;
    }
  }

  // Lưu kết quả sau khi hoàn thành
  // hoặc sau khi script tự dừng.
  saveReport();

  console.log(
    "\n=============== KẾT LUẬN ==============="
  );

  console.log(
    `Mức cao nhất đã test: ${highestTestedLevel} kết nối đồng thời.`
  );

  if (highestStableLevel > 0) {
    console.log(
      `Mức ổn định cao nhất ghi nhận: ${highestStableLevel} kết nối.`
    );
  } else {
    console.log(
      "Chưa ghi nhận mức kết nối nào hoàn toàn ổn định."
    );
  }

  if (firstUnstableLevel !== null) {
    console.log(
      `Bắt đầu mất ổn định tại: ${firstUnstableLevel} kết nối.`
    );
  }

  if (heavyOverloadLevel !== null) {
    console.log(
      `Quá tải nặng hoặc mất kết nối tại: ${heavyOverloadLevel} kết nối.`
    );
  } else {
    console.log(
      `Chưa ghi nhận quá tải nặng đến mức ${highestTestedLevel} kết nối.`
    );
  }

  console.log(
    "========================================"
  );

  console.log(
    "\nLưu ý: User-Agent mobile chỉ giả lập request từ điện thoại."
  );

  console.log(
    "Script này chưa tải toàn bộ CSS, JavaScript, hình ảnh và API như trình duyệt thật."
  );
}

// Chạy chương trình.
main().catch((error) => {
  console.error(
    "Lỗi chương trình:",
    error
  );

  process.exit(1);
});