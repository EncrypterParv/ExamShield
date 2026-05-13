// ─── Subjects ──────────────────────────────────────────────────────────────────
export const SUBJECTS = [
  {
    id: "fset",
    name: "Fundamentals Systems Environmental & Thinking",
    short: "FSET",
    icon: "🌍",
    color: "#6366f1",
    examType: "mcq",
    date: "May 12, 2026",
  },
  {
    id: "pod",
    name: "Products of Design",
    short: "POD",
    icon: "✏️",
    color: "#f59e0b",
    examType: "mcq",
    date: "May 13, 2026",
  },
  {
    id: "tap",
    name: "Tech & Policy",
    short: "T&P",
    icon: "⚖️",
    color: "#14b8a6",
    examType: "mcq",
    date: "May 14, 2026",
  },
  {
    id: "dsa",
    name: "Data Structures & Algorithms",
    short: "DSA",
    icon: "🧩",
    color: "#3b82f6",
    examType: "mixed",
    date: "May 15, 2026",
  },
  {
    id: "wap",
    name: "Web Application Programming",
    short: "WAP",
    icon: "🌐",
    color: "#ec4899",
    examType: "mixed",
    date: "May 16, 2026",
  },
];

// ─── MCQ Question Banks ────────────────────────────────────────────────────────
export const examQuestions = {
  fset: [
    {
      id: 1,
      question: "Which of the following best describes a 'system' in systems thinking?",
      options: [
        "A collection of unrelated parts",
        "A set of interconnected elements forming a unified whole",
        "A linear sequence of events",
        "A single component with a defined function",
      ],
      correct: 1,
    },
    {
      id: 2,
      question: "The concept of a 'feedback loop' in systems thinking refers to:",
      options: [
        "Data entering a system from outside",
        "A one-way information transfer",
        "A process where outputs influence future inputs",
        "Parallel processing in computing",
      ],
      correct: 2,
    },
    {
      id: 3,
      question: "Which environmental framework categorizes issues at micro, meso, and macro levels?",
      options: ["PESTLE", "SWOT", "Bronfenbrenner's Ecology", "Porter's Five Forces"],
      correct: 2,
    },
    {
      id: 4,
      question: "Critical thinking primarily involves:",
      options: [
        "Accepting information at face value",
        "Memorising established facts",
        "Evaluating arguments using evidence and logic",
        "Repeating conclusions from authority figures",
      ],
      correct: 2,
    },
    {
      id: 5,
      question: "An emergent property of a system is one that:",
      options: [
        "Exists in individual components before assembly",
        "Arises only from the interaction of components",
        "Can be predicted from a single part's behaviour",
        "Disappears when the system grows larger",
      ],
      correct: 1,
    },
  ],

  pod: [
    {
      id: 1,
      question: "Which design principle focuses on making products accessible to all users regardless of ability?",
      options: ["Universal Design", "Minimalism", "Biomimicry", "Planned Obsolescence"],
      correct: 0,
    },
    {
      id: 2,
      question: "The Double Diamond design process consists of:",
      options: [
        "Plan → Execute → Review → Deploy",
        "Discover → Define → Develop → Deliver",
        "Research → Prototype → Test → Launch",
        "Empathise → Ideate → Prototype → Test",
      ],
      correct: 1,
    },
    {
      id: 3,
      question: "A 'mood board' in product design is primarily used to:",
      options: [
        "Document technical specifications",
        "Communicate visual direction and aesthetic intent",
        "Record manufacturing costs",
        "Plan distribution logistics",
      ],
      correct: 1,
    },
    {
      id: 4,
      question: "Ergonomics in product design focuses on:",
      options: [
        "Aesthetic appeal",
        "Cost reduction",
        "Fitting products to human physical and cognitive needs",
        "Environmental sustainability",
      ],
      correct: 2,
    },
    {
      id: 5,
      question: "Which material property describes resistance to permanent deformation?",
      options: ["Ductility", "Hardness", "Conductivity", "Malleability"],
      correct: 1,
    },
  ],

  tap: [
    {
      id: 1,
      question: "Net neutrality is best described as:",
      options: [
        "Equal taxation of internet companies",
        "The principle that ISPs must treat all internet traffic equally",
        "A policy requiring free internet access for all citizens",
        "Government ownership of internet infrastructure",
      ],
      correct: 1,
    },
    {
      id: 2,
      question: "The GDPR primarily governs:",
      options: [
        "Software patent laws in the EU",
        "Personal data protection and privacy rights in the EU",
        "Cybersecurity standards for critical infrastructure",
        "E-commerce taxation across European borders",
      ],
      correct: 1,
    },
    {
      id: 3,
      question: "Algorithmic bias refers to:",
      options: [
        "Preferential treatment of certain programming languages",
        "Systematic errors in AI that produce unfair outcomes",
        "Faster processing for certain user groups",
        "Bias in compiler optimisation",
      ],
      correct: 1,
    },
    {
      id: 4,
      question: "Which legal concept protects original software code from being copied?",
      options: ["Patent", "Trademark", "Copyright", "Trade Secret"],
      correct: 2,
    },
    {
      id: 5,
      question: "The precautionary principle in technology policy states that:",
      options: [
        "Innovation should proceed without restriction",
        "If an action risks harm, preventive measures should be taken even under uncertainty",
        "Technologies should be deployed before being regulated",
        "Only proven harms justify regulatory intervention",
      ],
      correct: 1,
    },
  ],
};

// ─── MCQ for DSA and WAP ─────────────────────────────────────────────────────
export const mcqQuestions = {
  dsa: [
    {
      id: 101,
      question: "What is the time complexity of inserting an element at the beginning of a singly linked list?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
      correct: 2,
    },
    {
      id: 102,
      question: "Which data structure uses LIFO (Last In, First Out) order?",
      options: ["Queue", "Stack", "Deque", "Priority Queue"],
      correct: 1,
    },
    {
      id: 103,
      question: "What is the worst-case time complexity of QuickSort?",
      options: ["O(n log n)", "O(n)", "O(n²)", "O(log n)"],
      correct: 2,
    },
    {
      id: 104,
      question: "In a Min-Heap, the root node contains:",
      options: ["The maximum element", "The minimum element", "A random element", "The median element"],
      correct: 1,
    },
    {
      id: 105,
      question: "Which traversal of a Binary Search Tree visits nodes in sorted order?",
      options: ["Pre-order", "Post-order", "In-order", "Level-order"],
      correct: 2,
    },
  ],
  wap: [
    {
      id: 201,
      question: "Which HTTP method is idempotent and should not change server state?",
      options: ["POST", "PUT", "GET", "PATCH"],
      correct: 2,
    },
    {
      id: 202,
      question: "What does the CSS `box-model` consist of (from inside to outside)?",
      options: [
        "Content → Border → Padding → Margin",
        "Content → Padding → Border → Margin",
        "Padding → Content → Border → Margin",
        "Margin → Border → Padding → Content",
      ],
      correct: 1,
    },
    {
      id: 203,
      question: "Which JavaScript method returns a new array without modifying the original?",
      options: [".push()", ".splice()", ".map()", ".sort()"],
      correct: 2,
    },
    {
      id: 204,
      question: "What is the default value of the CSS `position` property?",
      options: ["relative", "absolute", "fixed", "static"],
      correct: 3,
    },
    {
      id: 205,
      question: "Which HTTP status code indicates a resource was successfully created?",
      options: ["200 OK", "201 Created", "204 No Content", "301 Moved Permanently"],
      correct: 1,
    },
  ],
};

// ─── Coding Questions ──────────────────────────────────────────────────────────
export const codingQuestions = {
  dsa: [
    {
      id: 1,
      title: "Reverse a Linked List",
      difficulty: "Medium",
      description:
        "Given the head of a singly linked list, reverse the list and return the reversed list.",
      constraints: "The number of nodes in the list is in the range [0, 5000].\n-5000 ≤ Node.val ≤ 5000",
      examples: [
        { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
        { input: "head = [1,2]", output: "[2,1]" },
      ],
      starterCode: {
        "C++": `// Definition for singly-linked list.
struct ListNode {
    int val;
    ListNode *next;
    ListNode(int x) : val(x), next(NULL) {}
};

class Solution {
public:
    ListNode* reverseList(ListNode* head) {
        // Write your solution here
        
    }
};`,
        Java: `// Definition for singly-linked list.
class ListNode {
    int val;
    ListNode next;
    ListNode(int x) { val = x; }
}

class Solution {
    public ListNode reverseList(ListNode head) {
        // Write your solution here
        
    }
}`,
        Python: `# Definition for singly-linked list.
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def reverseList(self, head):
        # Write your solution here
        pass`,
        JavaScript: `/**
 * @param {ListNode} head
 * @return {ListNode}
 */
var reverseList = function(head) {
    // Write your solution here
    
};`,
      },
    },
    {
      id: 2,
      title: "Binary Search",
      difficulty: "Easy",
      description:
        "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If target exists, return its index. Otherwise, return -1.",
      constraints: "1 ≤ nums.length ≤ 10⁴\n-10⁴ < nums[i], target < 10⁴\nAll integers in nums are unique.",
      examples: [
        { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4" },
        { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1" },
      ],
      starterCode: {
        "C++": `class Solution {
public:
    int search(vector<int>& nums, int target) {
        // Write your solution here
        
    }
};`,
        Java: `class Solution {
    public int search(int[] nums, int target) {
        // Write your solution here
        
    }
}`,
        Python: `class Solution:
    def search(self, nums, target):
        # Write your solution here
        pass`,
        JavaScript: `var search = function(nums, target) {
    // Write your solution here
    
};`,
      },
    },
  ],

  wap: [
    {
      id: 1,
      title: "Build a Todo REST API",
      difficulty: "Medium",
      description:
        "Implement a simple RESTful API endpoint that handles a GET request to `/api/todos`. The endpoint should return a JSON array of todo items. Each item has an `id` (number), `title` (string), and `completed` (boolean) field.",
      constraints:
        "Return at least 3 todo items.\nUse proper HTTP status codes.\nResponse Content-Type must be application/json.",
      examples: [
        {
          input: "GET /api/todos",
          output: `[{"id":1,"title":"Buy groceries","completed":false},{"id":2,"title":"Do laundry","completed":true}]`,
        },
      ],
      starterCode: {
        JavaScript: `// Express.js
const express = require('express');
const app = express();

app.get('/api/todos', (req, res) => {
    // Write your solution here
    
});

app.listen(3000);`,
        Python: `# Flask
from flask import Flask, jsonify
app = Flask(__name__)

@app.route('/api/todos')
def get_todos():
    # Write your solution here
    pass

if __name__ == '__main__':
    app.run()`,
        Java: `// Spring Boot
@RestController
public class TodoController {

    @GetMapping("/api/todos")
    public List<Todo> getTodos() {
        // Write your solution here
        return null;
    }
}`,
        "C++": `// No standard web framework — pseudo-code allowed
// Describe your REST endpoint design below:

// GET /api/todos
// Response: 200 OK
// Body: [...]
`,
      },
    },
    {
      id: 2,
      title: "CSS Flexbox Layout",
      difficulty: "Easy",
      description:
        "Write the CSS to create a responsive navigation bar using Flexbox. The navbar should have the logo aligned to the left, navigation links centred, and a login button aligned to the right. The layout must collapse gracefully on screens smaller than 768px.",
      constraints: "Use only CSS Flexbox (no Grid).\nMust be responsive.\nLinks should have a hover effect.",
      examples: [
        {
          input: "Desktop (>768px)",
          output: "[Logo] ---- [Nav Links] ---- [Login Button]",
        },
        {
          input: "Mobile (<768px)",
          output: "Stacked column layout",
        },
      ],
      starterCode: {
        JavaScript: `/* Write your CSS solution below */

.navbar {
    /* Your flexbox styles here */
}

.navbar .logo {
    /* Logo alignment */
}

.navbar .nav-links {
    /* Centre the links */
}

.navbar .login-btn {
    /* Right alignment */
}

@media (max-width: 768px) {
    /* Mobile responsive styles */
}`,
        Python: `# CSS is language-agnostic — write your CSS below:

# .navbar {
#     display: flex;
#     justify-content: space-between;
#     align-items: center;
# }
# Add your full solution...`,
        Java: `/* Write your CSS solution below */

.navbar {
    /* Your flexbox styles here */
}`,
        "C++": `/* Write your CSS solution below */

.navbar {
    /* Your flexbox styles here */
}`,
      },
    },
  ],
};

// ─── Simulated output for code runner ─────────────────────────────────────────
export const simulatedOutputs = {
  success: [
    "All test cases passed ✓\nRuntime: 52ms\nMemory: 14.2 MB",
    "Accepted ✓\n3/3 test cases passed\nRuntime: 68ms\nMemory: 16.8 MB",
    "Compilation successful\nAll tests passed ✓\nRuntime: 44ms\nMemory: 12.1 MB",
  ],
  error: [
    "Compilation Error:\nLine 7: expected ';' before '}' token",
    "Runtime Error:\nNullPointerException at line 12",
    "Time Limit Exceeded\nTest case 3/3 failed",
  ],
};

// ─── Student seed data ─────────────────────────────────────────────────────────
function makeFlag(id, reason, timestamp, confidence, subjectId, audioObs, audioIcon, audioSeverity, audioLevel, status = "Pending") {
  // Simulate an incident window around the timestamp
  const incidentDurationSec = Math.floor(Math.random() * 20) + 8; // 8–27 s
  const startTs = new Date(timestamp.replace(" ", "T"));
  const endTs   = new Date(startTs.getTime() + incidentDurationSec * 1000);

  const fmt = (d) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return {
    id,
    reason,
    timestamp,
    confidence,
    status,
    subjectId,
    incidentStart:    fmt(startTs),
    incidentEnd:      fmt(endTs),
    incidentDuration: incidentDurationSec,
    incidentStartSec: 0, // offset into video — kept 0 for prototype
    recordingBlobUrl:  null,
    screenshotDataUrl: null,
    audioObservation:  audioObs,
    audioIcon,
    audioSeverity,
    audioLevel,
  };
}

export const students = [
  {
    id: 1,
    name: "Aarav Sharma",
    email: "aarav.sharma@university.edu",
    rollNo: "CS2021001",
    risk: "High",
    terminated: false,
    terminatedSubjects: [],
    flags: [
      makeFlag("f1", "Tab switch detected",       "2026-05-12 10:12:34", 82, "dsa",  "Background noise detected",  "🔊",  "medium", 45),
      makeFlag("f2", "Face not visible in camera", "2026-05-12 10:18:05", 91, "dsa",  "No unusual audio",          "✅",  "low",    12),
    ],
  },
  {
    id: 2,
    name: "Priya Patel",
    email: "priya.patel@university.edu",
    rollNo: "CS2021002",
    risk: "Medium",
    terminated: false,
    terminatedSubjects: [],
    flags: [
      makeFlag("f3", "Multiple faces detected", "2026-05-12 10:25:11", 67, "fset", "Multiple voices detected", "🗣️", "high",   78),
    ],
  },
  {
    id: 3,
    name: "Rohan Mehta",
    email: "rohan.mehta@university.edu",
    rollNo: "CS2021003",
    risk: "Low",
    terminated: false,
    terminatedSubjects: [],
    flags: [],
  },
  {
    id: 4,
    name: "Sneha Iyer",
    email: "sneha.iyer@university.edu",
    rollNo: "CS2021004",
    risk: "High",
    terminated: true,
    terminatedSubjects: ["wap"],
    flags: [
      makeFlag("f4", "Suspicious audio detected",         "2026-05-12 10:30:47", 78, "wap", "Multiple voices detected",  "🗣️", "high",   82),
      makeFlag("f5", "Tab switch detected",               "2026-05-12 10:33:20", 85, "wap", "Background noise detected", "🔊",  "medium", 55),
      makeFlag("f6", "Unauthorized extension activity",   "2026-05-12 10:35:59", 88, "wap", "No unusual audio",         "✅",  "low",     8),
    ],
  },
  {
    id: 5,
    name: "Kabir Singh",
    email: "kabir.singh@university.edu",
    rollNo: "CS2021005",
    risk: "Low",
    terminated: false,
    terminatedSubjects: [],
    flags: [],
  },
  {
    id: 6,
    name: "Ananya Reddy",
    email: "ananya.reddy@university.edu",
    rollNo: "CS2021006",
    risk: "Medium",
    terminated: false,
    terminatedSubjects: [],
    flags: [
      makeFlag("f7", "Copy-paste attempt detected", "2026-05-12 10:42:19", 60, "tap", "No unusual audio", "✅", "low", 8, "Reviewed"),
    ],
  },
  {
    id: 7,
    name: "Dev Malhotra",
    email: "dev.malhotra@university.edu",
    rollNo: "CS2021007",
    risk: "Medium",
    terminated: false,
    terminatedSubjects: [],
    flags: [
      makeFlag("f8", "Long screen absence detected", "2026-05-12 11:05:33", 72, "pod", "Background noise detected", "🔊", "medium", 38),
    ],
  },
  {
    id: 8,
    name: "Meera Nair",
    email: "meera.nair@university.edu",
    rollNo: "CS2021008",
    risk: "Low",
    terminated: false,
    terminatedSubjects: [],
    flags: [],
  },
];
