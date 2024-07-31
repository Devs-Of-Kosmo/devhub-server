package team.devs.devhub.domain.personalproject.dto;

import lombok.Getter;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Getter
@Setter
public class PersonalProjectSaveRequest {

    private Long fromCommitId;
    private List<MultipartFile> files;
    private String commitMessage;
}
