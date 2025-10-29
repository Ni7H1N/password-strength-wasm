/// Simple Shannon-entropy estimate over bytes (bits)
pub fn estimate_shannon_bits(s: &str) -> f64 {
    let mut freq = std::collections::HashMap::new();
    let bytes = s.as_bytes();
    for &b in bytes {
        *freq.entry(b).or_insert(0usize) += 1;
    }
    let len = bytes.len() as f64;
    if len == 0.0 { return 0.0; }
    let mut h = 0.0f64;
    for (_b, &count) in freq.iter() {
        let p = (count as f64) / len;
        h -= p * p.log2();
    }
    // total bits = entropy per symbol * symbols
    h * len
}
