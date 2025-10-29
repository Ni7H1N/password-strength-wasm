use sha1::{Sha1, Digest};

pub async fn check_pwned(password: &str) -> Option<u32> {
    let mut hasher = Sha1::new();
    hasher.update(password.as_bytes());
    let hash_bytes = hasher.finalize();
    let hash = format!("{:X}", hash_bytes);
    let prefix = &hash[..5];
    let suffix = &hash[5..];

    let url = format!("https://api.pwnedpasswords.com/range/{}", prefix);
    let client = reqwest::Client::new();
    let resp = client.get(&url).send().await.ok()?.text().await.ok()?;

    for line in resp.lines() {
        if let Some((h, count)) = line.split_once(':') {
            if h.trim().eq_ignore_ascii_case(suffix) {
                return count.trim().parse::<u32>().ok();
            }
        }
    }
    Some(0)
}
