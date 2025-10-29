/// Minimal pattern detectors
pub fn has_repeated_chars(s: &str) -> bool {
    // detect runs of same character longer than 3
    let mut prev: Option<char> = None;
    let mut run = 0usize;
    for c in s.chars() {
        if Some(c) == prev {
            run += 1;
            if run >= 3 { return true; }
        } else {
            prev = Some(c);
            run = 0;
        }
    }
    false
}

pub fn is_keyboard_spatial(s: &str) -> bool {
    // naive: detect common sequences like "qwerty", "asdf", "zxcv"
    let low = s.to_lowercase();
    let common = ["qwerty", "asdf", "zxcv", "12345", "password"];
    for pat in &common {
        if low.contains(pat) { return true; }
    }
    false
}
